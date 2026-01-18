import React from "react";
import Avatar from "./Avatar";
import {
  ArrowUturnLeftIcon,
  ArrowRightOnRectangleIcon,
  FaceSmileIcon,
} from "@heroicons/react/24/outline";
import { chatService } from "../services/api"; // Import api service
import { useEffect, useState } from "react"; // For LinkPreview component

// ... LinkPreview code stays same ...

const LinkPreview = ({ text }) => {
  const [preview, setPreview] = useState(null);
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const match = text.match(urlRegex);
  const url = match ? match[0] : null;

  useEffect(() => {
    if (url) {
      chatService
        .getLinkPreview(url)
        .then((res) => setPreview(res.data))
        .catch((err) => console.error(err));
    }
  }, [url]);

  if (!url || !preview || !preview.title) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block mt-2 bg-black/10 rounded overflow-hidden border border-white/10 hover:bg-black/20 transition-colors"
    >
      {preview.image && (
        <div className="h-32 w-full overflow-hidden">
          <img
            src={preview.image}
            alt={preview.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-2">
        <div className="font-bold text-sm truncate">{preview.title}</div>
        <div className="text-xs opacity-80 truncate">{preview.description}</div>
        <div className="text-[10px] opacity-60 mt-1">
          {new URL(url).hostname}
        </div>
      </div>
    </a>
  );
};

const MessageBubble = ({
  message,
  isOwnMessage,
  onReply,
  onForward,
  onReaction,
  currentUser,
  readStatus, // 'sent', 'read'
}) => {
  const isImage =
    message.type === "image" ||
    (message.attachment_url &&
      message.attachment_url.match(/\.(jpg|jpeg|png|gif)$/i));
  const isLocation =
    message.type === "location" && message.latitude && message.longitude;

  // Group reactions
  const reactions = (message.reactions || []).reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});

  const reactionTypes = Object.entries(reactions);

  return (
    <div
      className={`flex mb-4 max-w-[80%] group ${
        isOwnMessage ? "self-end flex-row-reverse" : "self-start flex-row"
      }`}
    >
      {/* Avatar Display */}
      <div className={`flex-shrink-0 ${isOwnMessage ? "ml-2" : "mr-2"}`}>
        <Avatar
          url={message.avatar}
          name={message.username}
          size="sm"
          className="border border-bg-tertiary"
        />
      </div>

      <div
        className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}
      >
        <div className="flex items-baseline gap-2 mb-1">
          {!isOwnMessage && (
            <span className="text-sm font-semibold text-text-primary">
              {message.username}
            </span>
          )}
          <span className="text-[0.7rem] text-text-secondary">
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {isOwnMessage && (
            <span className="flex items-center -ml-1">
              {readStatus === "read" ? (
                // Double Blue
                <div className="flex text-blue-400">
                  <svg
                    className="w-3 h-3 -mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              ) : (
                // Double Gray (Delivered/Default)
                <div className="flex text-gray-500">
                  <svg
                    className="w-3 h-3 -mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </span>
          )}
          {message.is_forwarded && (
            <span className="text-[0.7rem] text-text-secondary italic flex items-center gap-1">
              <ArrowRightOnRectangleIcon className="w-3 h-3" /> Forwarded
            </span>
          )}
        </div>

        <div
          onDoubleClick={() => onReaction(message.id, "❤️")}
          className={`
          relative px-4 py-3 shadow-md break-words cursor-pointer select-none transition-all duration-300
          ${
            isOwnMessage
              ? "bg-gradient-to-br from-accent to-purple-600 text-white rounded-2xl rounded-tr-none"
              : "bg-white/10 backdrop-blur-sm text-text-primary rounded-2xl rounded-tl-none border border-white/5"
          }
          ${reactionTypes.length > 0 ? "pb-6" : ""}
        `}
        >
          {/* Reply Context */}

          {message.reply_to_id && (
            <div
              className={`mb-2 p-2 rounded text-xs border-l-4 ${
                isOwnMessage
                  ? "bg-white/20 border-white/50"
                  : "bg-black/10 border-accent"
              }`}
            >
              <div className="font-semibold mb-1">{message.reply_username}</div>
              <div className="truncate opacity-80">
                {message.reply_type === "image"
                  ? "📷 Image"
                  : message.reply_type === "video"
                    ? "🎥 Video"
                    : message.reply_type === "audio"
                      ? "🎵 Audio"
                      : message.reply_content}
              </div>
            </div>
          )}
          {/* Media Rendering */}
          {message.type === "image" && message.attachment_url && (
            <div className="mb-2">
              <img
                src={
                  message.attachment_url.startsWith("http")
                    ? message.attachment_url
                    : `http://localhost:3000${message.attachment_url}`
                }
                alt="attachment"
                className="max-w-full rounded-lg max-h-[300px] object-cover"
              />
            </div>
          )}
          {message.type === "video" && message.attachment_url && (
            <div className="mb-2">
              <video
                src={
                  message.attachment_url.startsWith("http")
                    ? message.attachment_url
                    : `http://localhost:3000${message.attachment_url}`
                }
                controls
                className="max-w-full rounded-lg max-h-[300px]"
              />
            </div>
          )}
          {message.type === "audio" && message.attachment_url && (
            <div className="mb-2">
              <audio
                src={
                  message.attachment_url.startsWith("http")
                    ? message.attachment_url
                    : `http://localhost:3000${message.attachment_url}`
                }
                controls
                className="max-w-[250px]"
              />
            </div>
          )}
          {isLocation && (
            <div className="mb-2">
              <a
                href={`https://www.google.com/maps?q=${message.latitude},${message.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 underline"
                style={{ color: isOwnMessage ? "white" : "inherit" }}
              >
                📍 View on Map
              </a>
            </div>
          )}
          {message.content && (
            <div>
              {message.content}
              <LinkPreview text={message.content} />
            </div>
          )}
          {/* Reactions Display */}
          {reactionTypes.length > 0 && (
            <div className="absolute -bottom-3 right-0 flex gap-1 bg-bg-secondary p-1 rounded-full shadow-sm border border-bg-tertiary">
              {reactionTypes.map(([type, count]) => (
                <span key={type} className="text-xs px-1">
                  {type} {count}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons (Visible on hover) */}
        <div
          className={`flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
            isOwnMessage ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <button
            onClick={() => onReply(message)}
            className="text-text-secondary hover:text-accent p-1"
            title="Reply"
          >
            <ArrowUturnLeftIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onForward(message)}
            className="text-text-secondary hover:text-accent p-1"
            title="Forward"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
          </button>
          <div className="relative group/emojis">
            <button
              className="text-text-secondary hover:text-accent p-1"
              title="React"
            >
              <FaceSmileIcon className="w-4 h-4" />
            </button>
            {/* Reaction Picker Popover: Overlap with button to prevent closing */}
            <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 pb-4 hidden group-hover/emojis:flex z-10 transition-all duration-200">
              <div className="bg-bg-secondary shadow-lg rounded-full p-1 border border-bg-tertiary flex gap-1 transform scale-100 origin-bottom">
                {["👍", "❤️", "😂", "😮", "😢"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => onReaction(message.id, emoji)}
                    className="hover:scale-125 transition-transform px-1"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
