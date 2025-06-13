const express = require("express");
const {
  loginUser,
  logoutUser,
  verifySession,
  registerUser,
  verifyEmail,
} = require("../controllers/authController");
const {
  validateLogin,
  validateRegister,
} = require("../middleware/validators/authValidator");
const csrfValidator = require("../middleware/validators/csrfValidator");
const rateLimit = require("express-rate-limit");
const passport = require("passport");

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again later.",
});

const router = express.Router();

// Local login
router.post(
  "/login",
  /*loginRateLimiter, csrfValidator,*/
  validateLogin,
  loginUser
);
router.post("/logout", logoutUser);
router.get("/verify-session", verifySession);
router.post("/register", /*csrfValidator,*/ validateRegister, registerUser);
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Google OAuth callback
const isDevelopment = process.env.NODE_ENV === "development";

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    res.cookie("session_id", req.user.sessionId, {
      httpOnly: true,
      secure: !isDevelopment,
      sameSite: isDevelopment ? "Lax" : "None",
    });

    const redirectUrl = isDevelopment
      ? "http://localhost:3000/"
      : "https://local-loop-five.vercel.app/";

    res.redirect(redirectUrl);
  }
);

router.post("/verify-email", verifyEmail);

module.exports = router;
