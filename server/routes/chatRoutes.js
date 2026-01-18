const express = require("express");
const router = express.Router();
const ChatController = require("../controllers/ChatController");
const authenticateToken = require("../middleware/authMiddleware");
const { Room } = require("../models");

router.get("/rooms", authenticateToken, ChatController.getRooms);
router.post("/rooms/dm", authenticateToken, ChatController.createDirectRoom);
router.post("/room", authenticateToken, ChatController.createRoom);
router.get(
  "/room/:roomId/media",
  authenticateToken,
  ChatController.getRoomMedia,
);
router.get("/room/:roomId", ChatController.getRoomDetails);
router.put("/room/:roomId", authenticateToken, ChatController.updateRoom);
router.delete("/room/:roomId", authenticateToken, ChatController.deleteRoom);

// Utility route
router.get(
  "/utils/link-preview",
  authenticateToken,
  ChatController.getLinkPreview,
);

// History route (must be last to avoid collisions if roomId is not numeric type strict)
router.get("/:roomId", authenticateToken, ChatController.getHistory);

module.exports = router;
