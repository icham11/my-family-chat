const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/AuthController");
const authenticateToken = require("../middleware/authMiddleware");
const passport = require("passport");

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  AuthController.googleCallback,
);

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/me", authenticateToken, AuthController.getMe);

module.exports = router;
