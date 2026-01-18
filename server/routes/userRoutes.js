const express = require("express");
const router = express.Router();
const { User } = require("../models");
const authenticateToken = require("../middleware/authMiddleware");

const UserController = require("../controllers/UserController");

// Get current user profile
router.get("/profile", authenticateToken, UserController.getProfile);

// Search users
router.get("/search", authenticateToken, UserController.searchUsers);

// Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
  const { bio, avatar_url } = req.body;
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.bio = bio;
    user.avatar_url = avatar_url;
    await user.save();

    res.json({
      id: user.id,
      username: user.username,
      bio: user.bio,
      avatar_url: user.avatar_url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
