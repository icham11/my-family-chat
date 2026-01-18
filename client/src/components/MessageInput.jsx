import React, { useState, useRef } from "react";
import { chatService } from "../services/api";
import {
  PhotoIcon,
  XMarkIcon,
  MapPinIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/solid";

const MessageInput = ({ onSendMessage, replyingTo, onCancelReply }) => {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Video Duration Validation
      if (file.type.startsWith("video/")) {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = function () {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > 30) {
            alert("Video must be 30 seconds or less.");
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
          } else {
            setSelectedFile(file);
          }
        };
        video.src = URL.createObjectURL(file);
      } else {
        setSelectedFile(file);
      }
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && !selectedFile) return;

    let attachmentUrl = null;
    let type = "text";

    if (selectedFile) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("image", selectedFile);
        const { data } = await chatService.uploadImage(formData); // This endpoint is generic despite the name
        attachmentUrl = data.filePath;

        if (selectedFile.type.startsWith("video/")) type = "video";
        else if (selectedFile.type.startsWith("audio/")) type = "audio";
        else type = "image";
      } catch (error) {
        console.error("Upload failed", error);
        alert("Failed to upload media");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    onSendMessage({
      content: message,
      type,
      attachmentUrl,
    });

    setMessage("");
    clearFile();
  };

  const handleLocationShare = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onSendMessage({
          content: "Shared a location",
          type: "location",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting location", error);
        alert("Unable to retrieve your location");
      },
    );
  };

  return (
    <div className="flex flex-col border-t border-bg-tertiary bg-bg-secondary">
      {replyingTo && (
        <div className="px-4 py-2 bg-bg-tertiary/50 border-b border-bg-tertiary flex items-center justify-between">
          <div className="flex flex-col text-sm border-l-4 border-accent pl-2">
            <span className="font-semibold text-accent">
              Replying to {replyingTo.username}
            </span>
            <span className="text-text-secondary truncate max-w-xs">
              {replyingTo.type === "image" ? "📷 Image" : replyingTo.content}
            </span>
          </div>
          <button
            onClick={onCancelReply}
            className="text-text-secondary hover:text-danger p-1"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-2">
        {selectedFile && (
          <div className="flex items-center gap-2 bg-bg-tertiary p-2 rounded-lg w-fit">
            <span className="text-sm text-text-secondary truncate max-w-[200px]">
              {selectedFile.name}
            </span>
            <button
              type="button"
              onClick={clearFile}
              className="text-text-secondary hover:text-danger"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}

        <div className="flex gap-4 items-center">
          <button
            type="button"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.accept = "image/*";
                fileInputRef.current.click();
              }
            }}
            className="text-text-secondary hover:text-accent transition-colors"
            title="Upload Image"
          >
            <PhotoIcon className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.accept = "video/*,audio/*";
                fileInputRef.current.click();
              }
            }}
            className="text-text-secondary hover:text-accent transition-colors"
            title="Upload Video/Audio"
          >
            <VideoCameraIcon className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={handleLocationShare}
            className="text-text-secondary hover:text-accent transition-colors"
            title="Share Location"
          >
            <MapPinIcon className="w-6 h-6" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            // Accept will be set dynamically or default to loose
            className="hidden"
          />

          <input
            type="text"
            className="input-field flex-1"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={(!message.trim() && !selectedFile) || isUploading}
          >
            {isUploading ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
