import React, { useState, useEffect } from "react";
import { chatService } from "../services/api";

const EditRoomModal = ({ room, onClose, onRoomUpdated }) => {
  const [name, setName] = useState(room.name);
  const [description, setDescription] = useState(room.description || "");
  const [avatarUrl, setAvatarUrl] = useState(room.avatar_url || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleAvatarUpload = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", e.target.files[0]);
      const { data } = await chatService.uploadImage(formData);
      setAvatarUrl(data.filePath);
    } catch (error) {
      console.error("Failed to upload avatar", error);
      setError("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const { data: updatedRoom } = await chatService.updateRoom(room.id, {
        name,
        description,
        avatar_url: avatarUrl,
      });
      onRoomUpdated(updatedRoom);
    } catch (err) {
      console.error(err);
      setError("Failed to update room");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg-secondary p-6 rounded-lg w-full max-w-md border border-bg-tertiary">
        <h2 className="text-xl font-bold mb-4 text-text-primary">Edit Room</h2>

        {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-bg-tertiary overflow-hidden relative group">
              {avatarUrl ? (
                <img
                  src={
                    avatarUrl.startsWith("http")
                      ? avatarUrl
                      : `http://localhost:3000${avatarUrl}`
                  }
                  alt="Room Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-secondary text-2xl font-bold">
                  {name ? name.charAt(0).toUpperCase() : "?"}
                </div>
              )}
              <label className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <span className="text-xs">Change</span>
                <input
                  type="file"
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Room Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field w-full resize-none h-20"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded hover:bg-bg-tertiary text-text-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="btn btn-primary"
            >
              {uploading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRoomModal;
