import React, { useState } from "react";
import { chatService } from "../services/api";

const AddMemberModal = ({ isOpen, onClose, roomId, onMemberAdded }) => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      await chatService.addMember(roomId, username);
      setUsername("");
      onMemberAdded();
      onClose();
      alert("Member added successfully!");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to add member. Check username.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-bg-secondary w-full max-w-md rounded-2xl p-6 shadow-xl border border-white/10">
        <h2 className="text-xl font-semibold mb-4 text-white">
          Add Member to Group
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-text-secondary block mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username exactly"
              className="w-full bg-bg-tertiary border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent"
              autoFocus
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-text-secondary hover:text-white transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-accent text-white rounded-xl hover:bg-accent/80 transition-colors disabled:opacity-50"
              disabled={isLoading || !username.trim()}
            >
              {isLoading ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
