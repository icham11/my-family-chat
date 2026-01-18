import React, { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import {
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Avatar from "./Avatar";

const ChatWindow = ({
  room,
  roomDetails,
  messages,
  currentUser,
  onSendMessage,
  replyingTo,
  onCancelReply,
  onReply,
  onForward,
  onReaction,
  onShowMedia,
  onEditRoom,
  onDeleteRoom,
  onBack,
}) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, replyingTo]);

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-secondary h-screen bg-bg-primary">
        Select a room to start chatting
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-bg-primary">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-bg-secondary/80 backdrop-blur-xl sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="md:hidden p-2 -ml-2 text-text-secondary hover:text-white"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <Avatar
            url={roomDetails?.avatar_url || room.avatar_url}
            name={room.name}
            size="md"
            className="bg-bg-tertiary"
          />
          <div>
            <h3 className="m-0 text-xl font-semibold">{room.name}</h3>
            <p className="text-xs text-text-secondary">
              {roomDetails
                ? `${roomDetails.memberCount} members`
                : "Loading..."}
              {room.description && ` • ${room.description}`}
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onShowMedia}
            className="text-text-secondary hover:text-accent p-2"
            title="Media History"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
          </button>

          {/* Room Actions */}
          <div className="relative group">
            <button className="text-text-secondary hover:text-accent p-2">
              <EllipsisVerticalIcon className="w-6 h-6" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-32 bg-bg-secondary rounded-lg shadow-lg border border-bg-tertiary hidden group-hover:block z-20">
              <button
                onClick={onEditRoom}
                className="w-full text-left px-4 py-2 hover:bg-bg-tertiary text-sm flex items-center gap-2"
              >
                <PencilIcon className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={onDeleteRoom}
                className="w-full text-left px-4 py-2 hover:bg-bg-tertiary text-sm text-red-500 flex items-center gap-2"
              >
                <TrashIcon className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col space-y-4">
        {messages.map((msg, index) => {
          let readStatus = "sent";
          if (msg.username === currentUser.username && roomDetails?.members) {
            const others = roomDetails.members.filter(
              (m) => m.id !== currentUser.id,
            );
            // Check if ANYONE has read this message (id <= last_read)
            // Or for DM, if THE other person has read it
            const readBySomeone = others.some((m) => {
              const lastRead = m.RoomMember?.last_read_message_id || 0;
              return lastRead >= msg.id;
            });

            if (readBySomeone) readStatus = "read";
          }

          return (
            <MessageBubble
              key={msg.id || index}
              message={msg}
              isOwnMessage={msg.username === currentUser.username}
              onReply={onReply}
              onForward={onForward}
              onReaction={onReaction}
              currentUser={currentUser}
              readStatus={readStatus}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSendMessage={onSendMessage}
        replyingTo={replyingTo}
        onCancelReply={onCancelReply}
      />
    </div>
  );
};

export default ChatWindow;
