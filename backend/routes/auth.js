const express = require("express");
const {
  loginUser,
  logoutUser,
  verifySession,
  registerUser,
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
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    res.cookie("session_id", req.user.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    });
    res.redirect("/");
  }
);

module.exports = router;
