const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");
const redisClient = require("../config/redis");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { validationResult } = require("express-validator");
const crypto = require("crypto");
const { sendEmail } = require("../helpers/mailer");

// Login a user
const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: "User not found" });
    }

    // After you fetch the user from Supabase
    if (!data.email_verified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in." });
    }

    // Check if user is registered with OAuth
    if (data.auth_provider === "oauth") {
      return res.status(400).json({
        message:
          "This account was registered using Google OAuth. Please log in with Google.",
      });
    }

    const isMatch = await bcrypt.compare(password, data.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const sessionId = jwt.sign(
      { userId: data.id, role: data.role },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    await redisClient.set(
      sessionId,
      JSON.stringify({
        userId: data.id,
        role: data.role,
        name: data.full_name,
        email: data.email,
      }),
      { EX: 900 }
    );

    res.cookie("session_id", sessionId, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      //domain: ".",
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        email: data.email,
        name: data.name,
        role: data.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Logout a user
const logoutUser = async (req, res) => {
  const sessionId = req.cookies.session_id;

  try {
    if (!sessionId) {
      return res.status(400).json({ message: "No session found" });
    }

    await redisClient.del(sessionId);

    res.clearCookie("session_id", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      //domain: ".",
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Verify session
const verifySession = async (req, res) => {
  const sessionId = req.cookies.session_id;

  try {
    if (!sessionId) {
      return res
        .status(401)
        .setHeader("Cache-Control", "no-store")
        .json({ message: "No session found" });
    }

    const sessionData = await redisClient.get(sessionId);

    if (!sessionData) {
      return res
        .status(401)
        .setHeader("Cache-Control", "no-store")
        .json({ message: "Invalid or expired session" });
    }

    const parsedSession = JSON.parse(sessionData);

    jwt.verify(sessionId, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .setHeader("Cache-Control", "no-store")
          .json({ message: "Invalid or expired token" });
      }

      if (
        decoded.userId !== parsedSession.userId ||
        decoded.role !== parsedSession.role
      ) {
        return res
          .status(401)
          .setHeader("Cache-Control", "no-store")
          .json({ message: "Session data mismatch" });
      }

      res
        .status(200)
        .setHeader(
          "Cache-Control",
          "private, no-cache, no-store, must-revalidate"
        )
        .setHeader("Pragma", "no-cache")
        .setHeader("Expires", "0")
        .setHeader("X-Content-Type-Options", "nosniff")
        .json({
          message: "Session is valid",
          session: {
            userId: parsedSession.userId,
            name: parsedSession.name,
            role: parsedSession.role,
            email: parsedSession.email,
          },
        });
    });
  } catch (error) {
    console.error("Verify session error:", error);
    res
      .status(500)
      .setHeader("Cache-Control", "no-store")
      .json({ message: "Internal server error" });
  }
};

const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, full_name } = req.body;
  const role = "consumer";

  try {
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    const { error } = await supabase.from("users").insert(
      [
        {
          email,
          password_hash: hashedPassword,
          full_name,
          role,
          auth_provider: "local",
          email_verification_token: verificationToken,
          email_verification_token_expires: tokenExpires,
        },
      ],
      { returning: "minimal" }
    );

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ message: "Error creating user" });
    }

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&email=${email}`;

    await sendEmail(email, process.env.SENDGRID_VERIFICATION_TEMPLATE_ID, {
      full_name,
      verification_link: verificationLink,
    });

    res
      .status(201)
      .json({ message: "User registered. Please verify your email." });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// OAuth Registration/Login
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (!profile || !profile.emails || !profile.emails.length) {
          return done(new Error("Invalid Google profile data"));
        }

        const email = profile.emails[0].value;

        const role = "consumer";

        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("email", email)
          .single();

        let user;
        if (existingUser) {
          if (existingUser.auth_provider !== "oauth") {
            return done(null, false, {
              message: "Email registered using a different method",
            });
          }
          user = existingUser;
        } else {
          const { data: newUser, error } = await supabase
            .from("users")
            .insert([
              {
                email,
                role,
                auth_provider: "oauth",
                email_verified: true, // ✅ Verified by Google
                email_verification_token: null,
                email_verification_token_expires: null,
              },
            ])
            .select()
            .single();

          if (error) return done(error);
          if (!newUser) return done(new Error("Failed to create new user"));

          user = newUser;
        }

        if (!user) {
          return done(new Error("User retrieval or creation failed"));
        }

        const sessionId = jwt.sign(
          { userId: user.id, role: user.role },
          process.env.SECRET_KEY,
          { expiresIn: "1h" }
        );

        await redisClient.set(
          sessionId,
          JSON.stringify({
            userId: user.id,
            role: user.role,
            email: user.email,
          }),
          { EX: 900 }
        );

        done(null, { sessionId, user });
      } catch (err) {
        done(err);
      }
    }
  )
);

passport.serializeUser((data, done) => done(null, data.sessionId));
passport.deserializeUser(async (sessionId, done) => {
  try {
    const sessionData = await redisClient.get(sessionId);
    if (!sessionData) return done(null, false);
    done(null, JSON.parse(sessionData));
  } catch (error) {
    done(error);
  }
});

const verifyEmail = async (req, res) => {
  const { email, token } = req.body;

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email_verification_token, email_verification_token_expires")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(400).json({ message: "Invalid email or token" });
    }

    if (
      user.email_verification_token !== token ||
      new Date() > new Date(user.email_verification_token_expires)
    ) {
      return res.status(400).json({ message: "Token invalid or expired" });
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({
        email_verified: true,
        email_verification_token: null,
        email_verification_token_expires: null,
      })
      .eq("id", user.id);

    if (updateError) {
      return res.status(500).json({ message: "Failed to verify email" });
    }

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  loginUser,
  logoutUser,
  verifySession,
  verifyEmail,
  registerUser,
};
