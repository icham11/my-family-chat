const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();
const passport = require("./config/passport");

const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const userRoutes = require("./routes/userRoutes");
const { Chat, User, Reaction } = require("./models");
const path = require("path");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(passport.initialize());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/user", userRoutes);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for dev
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  socket.on("send_message", async (data) => {
    // data: { userId, content, roomId, type, attachmentUrl, latitude, longitude, replyToId, isForwarded }
    try {
      const {
        userId,
        content,
        roomId,
        type,
        attachmentUrl,
        latitude,
        longitude,
        replyToId,
        isForwarded,
      } = data;

      // Save to database
      const newMessage = await Chat.create({
        user_id: userId,
        content,
        room_id: roomId,
        type,
        attachment_url: attachmentUrl,
        latitude,
        longitude,
        reply_to_id: replyToId,
        is_forwarded: isForwarded,
      });

      // Fetch formatted message with associations
      const formattedMessage = await Chat.findByPk(newMessage.id, {
        include: [
          {
            model: User,
            attributes: ["username"],
          },
          {
            model: Chat,
            as: "ReplyTo",
            include: [{ model: User, attributes: ["username"] }],
          },
          {
            model: Reaction,
            as: "reactions",
            include: [{ model: User, attributes: ["username"] }],
          },
        ],
      });

      // Flatten structure for client
      const plainMsg = formattedMessage.get({ plain: true });
      const clientMsg = {
        ...plainMsg,
        username: plainMsg.User.username,
        avatar: plainMsg.User.avatar_url,
        reply_content: plainMsg.ReplyTo ? plainMsg.ReplyTo.content : null,
        reply_type: plainMsg.ReplyTo ? plainMsg.ReplyTo.type : null,
        reply_username: plainMsg.ReplyTo
          ? plainMsg.ReplyTo.User.username
          : null,
        reactions: [],
      };

      // Broadcast to room
      io.to(roomId).emit("receive_message", clientMsg);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  });

  socket.on("send_reaction", async (data) => {
    console.log("SERVER: send_reaction payload:", data);
    try {
      const { messageId, userId, type, roomId } = data;

      // Upsert reaction? Users can have multiple reactions or one?
      // Assuming one reaction of a specific type per user per message?
      // Or just create. Unique constraint (message_id, user_id, type) handles duplicates.
      await Reaction.findOrCreate({
        where: { message_id: messageId, user_id: userId, type },
        defaults: { message_id: messageId, user_id: userId, type },
      });
    } catch (err) {
      // If it's a unique constraint error, it means race condition or duplicate,
      // which is fine, we just want to ensure it exists.
      if (err.name === "SequelizeUniqueConstraintError") {
        // Fallthrough to fetch and broadcast
        console.log("SERVER: Reaction duplicate, proceeding to broadcast.");
      } else {
        console.error("Error sending reaction:", err);
        return; // Don't broadcast if genuine error
      }
    }

    try {
      // Fetch updated message to broadcast (in separate try block to ensure fetching happens even after unique error)
      const updatedMessage = await Chat.findByPk(data.messageId, {
        include: [
          {
            model: User,
            attributes: ["username", "avatar_url"],
          },
          {
            model: Chat,
            as: "ReplyTo",
            include: [{ model: User, attributes: ["username"] }],
          },
          {
            model: Reaction,
            as: "reactions",
            include: [{ model: User, attributes: ["username"] }],
          },
        ],
      });

      if (!updatedMessage) {
        console.error(
          "SERVER: Message not found after reaction",
          data.messageId,
        );
        return;
      }

      // Flatten
      const plainMsg = updatedMessage.get({ plain: true });
      const clientMsg = {
        ...plainMsg,
        username: plainMsg.User.username,
        avatar: plainMsg.User.avatar_url,
        reply_content: plainMsg.ReplyTo ? plainMsg.ReplyTo.content : null,
        reply_type: plainMsg.ReplyTo ? plainMsg.ReplyTo.type : null,
        reply_username: plainMsg.ReplyTo
          ? plainMsg.ReplyTo.User.username
          : null,
        reactions: plainMsg.reactions.map((r) => ({
          type: r.type,
          user_id: r.user_id,
          username: r.User.username,
        })),
      };

      console.log("SERVER: Emitting receive_reaction to room:", data.roomId);
      io.to(data.roomId).emit("receive_reaction", clientMsg);
    } catch (err) {
      console.error("Error sending reaction:", err);
    }
  });

  socket.on("mark_read", async (data) => {
    try {
      const { roomId, userId, messageId } = data;
      // Update DB
      const { RoomMember } = require("./models");
      await RoomMember.update(
        { last_read_message_id: messageId },
        { where: { room_id: roomId, user_id: userId } },
      );

      // Broadcast to room so others see "read" status
      io.to(roomId).emit("user_read", { userId, roomId, messageId });
    } catch (err) {
      console.error("Error marking read:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
const { sequelize } = require("./models");

sequelize.sync({ alter: true }).then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
