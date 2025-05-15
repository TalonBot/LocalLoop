const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");
const redisClient = require("../config/redis");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { validationResult } = require("express-validator");

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

    const { error } = await supabase.from("users").insert(
      [
        {
          email,
          password_hash: hashedPassword,
          full_name,
          role,
          auth_provider: "local",
        },
      ],
      { returning: "minimal" }
    );

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ message: "Error creating user" });
    }

    res.status(201).json({ message: "User registered successfully" });
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

module.exports = {
  loginUser,
  logoutUser,
  verifySession,

  registerUser,
};
