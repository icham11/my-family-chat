const { Chat, User, Reaction, Room, RoomMember } = require("../models");

const ChatController = {
  async getHistory(req, res) {
    try {
      const { roomId } = req.params;
      const messages = await Chat.findAll({
        where: { room_id: roomId },
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
        order: [["created_at", "ASC"]],
      });

      // Flatten the structure to match what frontend expects
      const formattedMessages = messages.map((msg) => {
        const plainMsg = msg.get({ plain: true });
        return {
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
      });

      res.json(formattedMessages);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  async createRoom(req, res) {
    try {
      const { name, description, avatar_url } = req.body;
      if (!name)
        return res.status(400).json({ message: "Room name is required" });

      // Clean simple random string
      const invite_code = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      const newRoom = await Room.create({
        name,
        description,
        avatar_url,
        invite_code,
      });

      // Auto-join creator?
      if (req.user) {
        await RoomMember.create({
          user_id: req.user.id,
          room_id: newRoom.id,
          role: "admin",
        });
      }

      res.status(201).json(newRoom);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  async getRoomDetails(req, res) {
    try {
      const { roomId } = req.params;
      const room = await Room.findByPk(roomId, {
        include: [
          {
            model: User,
            through: { attributes: ["last_read_message_id", "role"] },
            attributes: ["id", "username", "avatar_url"],
          },
        ],
        attributes: [
          "id",
          "name",
          "description",
          "avatar_url",
          "invite_code",
          "type",
        ],
      });

      if (!room) return res.status(404).json({ message: "Room not found" });

      // Backfill invite code for old rooms
      if (room.type === "group" && !room.invite_code) {
        room.invite_code = Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();
        await room.save();
      }

      const plainRoom = room.get({ plain: true });
      const response = {
        ...plainRoom,
        memberCount: plainRoom.Users.length,
        members: plainRoom.Users, // Limit this if too many users? User requested "include detail... include sama jumlah anggota" and "avatar dari room chat"
      };

      res.json(response);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  async getRoomMedia(req, res) {
    try {
      const { roomId } = req.params;
      const { type } = req.query; // optional filter: image, video

      const whereClause = {
        room_id: roomId,
        attachment_url: { [require("sequelize").Op.ne]: null },
      };

      if (type) {
        whereClause.type = type;
      } else {
        // Default to image and video?
        whereClause.type = { [require("sequelize").Op.in]: ["image", "video"] };
      }

      const mediaMessages = await Chat.findAll({
        where: whereClause,
        order: [["created_at", "DESC"]],
        attributes: ["id", "attachment_url", "type", "created_at"],
        include: [{ model: User, attributes: ["username"] }],
      });

      res.json(mediaMessages);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  async getLinkPreview(req, res) {
    try {
      const { url } = req.query;
      if (!url) return res.status(400).json({ message: "URL is required" });

      const axios = require("axios");
      const cheerio = require("cheerio");

      const { data } = await axios.get(url, {
        headers: { "User-Agent": "FamilyChatConfigBot/1.0" },
      });
      const $ = cheerio.load(data);

      const title =
        $('meta[property="og:title"]').attr("content") ||
        $("title").text() ||
        "";
      const description =
        $('meta[property="og:description"]').attr("content") ||
        $('meta[name="description"]').attr("content") ||
        "";
      const image = $('meta[property="og:image"]').attr("content") || "";

      res.json({ title, description, image, url });
    } catch (err) {
      console.error("Link preview failed for " + req.query.url);
      res.json({ title: "", description: "", image: "", url: req.query.url });
    }
  },

  async updateRoom(req, res) {
    try {
      const { roomId } = req.params;
      const { name, description, avatar_url } = req.body;
      const room = await Room.findByPk(roomId);

      if (!room) return res.status(404).json({ message: "Room not found" });

      await room.update({ name, description, avatar_url });
      res.json(room);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  async deleteRoom(req, res) {
    try {
      const { roomId } = req.params;
      const room = await Room.findByPk(roomId);

      if (!room) return res.status(404).json({ message: "Room not found" });

      await room.destroy();
      res.json({ message: "Room deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
  async getRooms(req, res) {
    try {
      const { id: userId } = req.user;

      // Find all rooms the user is a member of
      const userRooms = await RoomMember.findAll({
        where: { user_id: userId },
        include: [
          {
            model: Room,
            include: [
              {
                model: RoomMember,
                include: [
                  {
                    model: User,
                    attributes: ["id", "username", "avatar_url"],
                  },
                ],
              },
            ],
          },
        ],
      });

      // Format response
      const rooms = await Promise.all(
        userRooms.map(async (ur) => {
          const room = ur.Room;
          // Calculate unread count
          // Count messages in this room with id > ur.last_read_message_id
          const lastReadId = ur.last_read_message_id || 0;
          const unreadCount = await Chat.count({
            where: {
              room_id: room.id,
              id: { [require("sequelize").Op.gt]: lastReadId },
            },
          });

          if (room.type === "direct") {
            // Find the "other" member
            const otherMember = room.RoomMembers.find(
              (rm) => rm.user_id !== userId,
            );
            // If no other member (e.g. self chat or issue), fallback
            const otherUser = otherMember ? otherMember.User : null;

            return {
              id: room.id,
              name: otherUser ? otherUser.username : "Unknown User",
              description: "Direct Message",
              avatar_url: otherUser ? otherUser.avatar_url : null,
              type: "direct",
              members_count: room.RoomMembers.length,
              other_user_id: otherUser ? otherUser.id : null,
              unread_count: unreadCount,
            };
          } else {
            // Group room
            return {
              id: room.id,
              name: room.name,
              description: room.description,
              avatar_url: room.avatar_url,
              type: "group",
              members_count: room.RoomMembers.length,
              unread_count: unreadCount,
            };
          }
        }),
      );

      res.json(rooms);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async createDirectRoom(req, res) {
    try {
      const { targetUserId } = req.body;
      const { id: currentUserId } = req.user;

      if (!targetUserId) {
        return res.status(400).json({ error: "Target user required" });
      }

      // Check if DM already exists
      const myDMs = await RoomMember.findAll({
        where: { user_id: currentUserId },
        include: [
          {
            model: Room,
            where: { type: "direct" },
            include: [{ model: RoomMember }],
          },
        ],
      });

      // Filter to find one that has the target user
      const existingRoomMember = myDMs.find((dm) => {
        const members = dm.Room.RoomMembers.map((rm) => rm.user_id);
        return members.includes(parseInt(targetUserId));
      });

      if (existingRoomMember) {
        return res.json(existingRoomMember.Room);
      }

      // Create new DM room
      const newRoom = await Room.create({
        type: "direct",
        name: null, // Will be dynamic
      });

      // Add members
      await RoomMember.bulkCreate([
        { room_id: newRoom.id, user_id: currentUserId, role: "admin" },
        { room_id: newRoom.id, user_id: targetUserId, role: "member" },
      ]);

      res.status(201).json(newRoom);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
  async joinRoom(req, res) {
    try {
      const { inviteCode } = req.body;
      const { id: userId } = req.user;

      if (!inviteCode) {
        return res.status(400).json({ message: "Invite code is required" });
      }

      const room = await Room.findOne({ where: { invite_code: inviteCode } });
      if (!room) {
        return res.status(404).json({ message: "Invalid invite code" });
      }

      // Check if already a member
      const existingMember = await RoomMember.findOne({
        where: { room_id: room.id, user_id: userId },
      });

      if (existingMember) {
        return res.json({ message: "Already a member", room });
      }

      await RoomMember.create({
        room_id: room.id,
        user_id: userId,
        role: "member",
      });

      res.json({ message: "Joined successfully", room });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
  async addMember(req, res) {
    try {
      const { roomId } = req.params;
      const { username } = req.body;

      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }

      const room = await Room.findByPk(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      const userToAdd = await User.findOne({ where: { username } });
      if (!userToAdd) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if already a member
      const existingMember = await RoomMember.findOne({
        where: { room_id: room.id, user_id: userToAdd.id },
      });

      if (existingMember) {
        return res.status(400).json({ message: "User is already a member" });
      }

      await RoomMember.create({
        room_id: room.id,
        user_id: userToAdd.id,
        role: "member",
      });

      // Fetch updated room details to return? Or just success message
      // Let's return the added user so frontend can update list immediately
      res.json({ message: "Member added successfully", user: userToAdd });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
};

module.exports = ChatController;
