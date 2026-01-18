import React, { useEffect, useState, useRef } from "react";
import NewChatModal from "../components/NewChatModal";

import { io } from "socket.io-client";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ForwardModal from "../components/ForwardModal";
import AddRoomModal from "../components/AddRoomModal";
import EditRoomModal from "../components/EditRoomModal";
import MediaHistoryModal from "../components/MediaHistoryModal";
import { useAuth } from "../context/AuthContext";
import { chatService, SERVER_URL } from "../services/api";

const ENDPOINT = SERVER_URL;

const ChatPage = () => {
  const { user, logout } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showEditRoomModal, setShowEditRoomModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const socketRef = useRef();

  const handleDeleteRoom = async () => {
    if (
      !currentRoom ||
      !window.confirm(`Are you sure you want to delete ${currentRoom.name}?`)
    )
      return;
    try {
      await chatService.deleteRoom(currentRoom.id);
      setCurrentRoom(null);
      fetchRooms(); // Refresh list. If current deleted, selection clears.
    } catch (err) {
      console.error("Failed to delete room", err);
      alert("Failed to delete room");
    }
  };

  const fetchRooms = async () => {
    try {
      const { data } = await chatService.getRooms();
      setRooms(data);
      // If no room selected and we have rooms, select first?
      // Or if just created, maybe select the new one? Simple refresh for now.
    } catch (err) {
      console.error("Failed to load rooms", err);
    }
  };

  const currentRoomRef = useRef(null);

  // Keep ref in sync with state
  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  useEffect(() => {
    // 1. Connect to Socket
    socketRef.current = io(ENDPOINT);

    // 1.5 Handle Reconnection
    socketRef.current.on("connect", () => {
      console.log("Connected to server");
      // If we were already in a room, re-join it
      if (currentRoomRef.current) {
        console.log("Re-joining room:", currentRoomRef.current.id);
        socketRef.current.emit("join_room", currentRoomRef.current.id);
      }
    });

    // 2. Listen for incoming messages
    socketRef.current.on("receive_message", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
      // Update rooms unread count if msg is for another room
      if (
        !currentRoomRef.current ||
        currentRoomRef.current.id !== newMessage.room_id
      ) {
        setRooms((prevRooms) =>
          prevRooms.map((r) => {
            if (r.id === newMessage.room_id) {
              return { ...r, unread_count: (r.unread_count || 0) + 1 };
            }
            return r;
          }),
        );
      }

      // If we are in this room, mark as read
      if (
        currentRoomRef.current &&
        currentRoomRef.current.id === newMessage.room_id
      ) {
        socketRef.current.emit("mark_read", {
          roomId: newMessage.room_id,
          userId: user.id,
          messageId: newMessage.id,
        });
      }
    });

    // 3. Listen for incoming reactions
    socketRef.current.on("receive_reaction", (updatedMessage) => {
      console.log("CLIENT: receive_reaction event", updatedMessage);
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === updatedMessage.id) {
            console.log("CLIENT: Updating message", msg.id);
            return updatedMessage;
          }
          return msg;
        }),
      );
    });

    // 4. Listen for read receipts
    socketRef.current.on("user_read", ({ userId, roomId, messageId }) => {
      if (currentRoomRef.current?.id === roomId) {
        setRoomDetails((prev) => {
          if (!prev) return prev;
          // Update the specific member's last_read_message_id
          const updatedMembers = prev.members.map((m) => {
            if (m.id === userId) {
              return {
                ...m,
                RoomMember: {
                  ...m.RoomMember,
                  last_read_message_id: messageId,
                },
              };
            }
            return m;
          });
          return { ...prev, members: updatedMembers };
        });
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []); // Run once on mount

  useEffect(() => {
    fetchRooms().then(() => {
      // Optional: auto select first if needed
    });
  }, []);

  const [roomDetails, setRoomDetails] = useState(null); // Add state

  // ...

  const handleSelectRoom = async (room) => {
    if (currentRoom?.id === room.id) return;

    setCurrentRoom(room);
    setRoomDetails(null); // Reset details
    setReplyingTo(null);

    // Reset unread count locally
    setRooms((prev) =>
      prev.map((r) => (r.id === room.id ? { ...r, unread_count: 0 } : r)),
    );

    // Join socket room
    socketRef.current.emit("join_room", room.id);

    // Fetch History & Details
    try {
      const { data: history } = await chatService.getHistory(room.id);
      setMessages(history);

      const { data: details } = await chatService.getRoomDetails(room.id);
      setRoomDetails(details);

      // Mark last message as read
      if (history.length > 0) {
        const lastMsg = history[history.length - 1];
        socketRef.current.emit("mark_read", {
          roomId: room.id,
          userId: user.id,
          messageId: lastMsg.id,
        });
      }
    } catch (err) {
      console.error("Failed to load room data", err);
    }
  };

  const handleSendMessage = (messageData) => {
    if (!currentRoom || !user) return;

    // messageData can be string (old way) or object { content, type, attachmentUrl, latitude, longitude }
    const content =
      typeof messageData === "string" ? messageData : messageData.content;
    const type = messageData.type || "text";
    const attachmentUrl = messageData.attachmentUrl || null;
    const latitude = messageData.latitude || null;
    const longitude = messageData.longitude || null;

    socketRef.current.emit("send_message", {
      userId: user.id,
      content,
      type,
      attachmentUrl,
      latitude,
      longitude,
      roomId: currentRoom.id,
      replyToId: replyingTo ? replyingTo.id : null,
    });
    setReplyingTo(null);
  };

  const handleReply = (message) => {
    setReplyingTo(message);
  };

  const handleForwardInit = (message) => {
    setForwardingMessage(message);
  };

  const handleForwardSubmit = (targetRoomId) => {
    if (!forwardingMessage || !user) return;

    socketRef.current.emit("send_message", {
      userId: user.id,
      content: forwardingMessage.content,
      type: forwardingMessage.type,
      attachmentUrl: forwardingMessage.attachment_url,
      latitude: forwardingMessage.latitude,
      longitude: forwardingMessage.longitude,
      roomId: targetRoomId,
      isForwarded: true,
    });
    setForwardingMessage(null);
    // Optionally switch to that room? For now, stay here.
    alert("Message forwarded!");
  };

  const handleReaction = (messageId, type) => {
    if (!currentRoom || !user) return;
    socketRef.current.emit("send_reaction", {
      messageId,
      userId: user.id,
      type,
      roomId: currentRoom.id,
    });
  };

  // Filter messages for display to ensure safety
  const displayedMessages = messages.filter(
    (m) => m.room_id === currentRoom?.id,
  );

  const handleBackToSidebar = () => {
    setCurrentRoom(null);
  };

  return (
    <div className="flex h-screen w-screen bg-bg-primary text-text-primary overflow-hidden">
      {/* Sidebar: Hidden on mobile when room is selected, visible on desktop always */}
      <div
        className={`flex-shrink-0 transition-all duration-300 ease-in-out
          ${currentRoom ? "hidden md:flex" : "flex w-full md:w-auto"}
        `}
      >
        <Sidebar
          rooms={rooms}
          currentRoom={currentRoom}
          onJoinRoom={handleSelectRoom}
          onAddRoom={() => setShowAddRoomModal(true)}
          onNewChat={() => setShowNewChatModal(true)}
        />
      </div>

      {/* ChatWindow: Visible on mobile when room is selected, hidden otherwise (unless desktop) */}
      <div
        className={`flex-1 flex-col transition-all duration-300 ease-in-out
          ${currentRoom ? "flex fixed inset-0 z-20 md:static bg-bg-primary" : "hidden md:flex"}
        `}
      >
        <ChatWindow
          room={currentRoom}
          roomDetails={roomDetails}
          messages={displayedMessages}
          currentUser={user}
          onSendMessage={handleSendMessage}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          onReply={handleReply}
          onForward={handleForwardInit}
          onReaction={handleReaction}
          onShowMedia={() => setShowMediaModal(true)}
          onEditRoom={() => setShowEditRoomModal(true)}
          onDeleteRoom={handleDeleteRoom}
          onBack={handleBackToSidebar}
        />
      </div>
      {/* Dynamic Import or standard import if at top */}
      <ForwardModal
        isOpen={!!forwardingMessage}
        onClose={() => setForwardingMessage(null)}
        rooms={rooms}
        onForward={handleForwardSubmit}
      />
      {showAddRoomModal && (
        <AddRoomModal
          onClose={() => setShowAddRoomModal(false)}
          onRoomCreated={() => {
            setShowAddRoomModal(false);
            fetchRooms();
          }}
        />
      )}
      {showMediaModal && (
        <MediaHistoryModal
          roomId={currentRoom?.id}
          onClose={() => setShowMediaModal(false)}
        />
      )}
      {showEditRoomModal && currentRoom && (
        <EditRoomModal
          room={currentRoom}
          onClose={() => setShowEditRoomModal(false)}
          onRoomUpdated={(updatedRoom) => {
            setShowEditRoomModal(false);
            fetchRooms();
            setCurrentRoom(updatedRoom);
            // Also refresh details of current room if needed
            chatService
              .getRoomDetails(updatedRoom.id)
              .then((res) => setRoomDetails(res.data));
          }}
        />
      )}
      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onChatCreated={(newRoom) => {
            setShowNewChatModal(false);
            fetchRooms().then(() => {
              chatService.getRooms().then((res) => {
                const fullRoom = res.data.find((r) => r.id === newRoom.id);
                if (fullRoom) handleSelectRoom(fullRoom);
              });
            });
          }}
        />
      )}
    </div>
  );
};

export default ChatPage;
