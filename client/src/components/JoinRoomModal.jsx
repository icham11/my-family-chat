import React, { useState } from "react";
import { chatService } from "../services/api";

const JoinRoomModal = ({ onClose, onJoined }) => {
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setLoading(true);
    setError("");

    try {
      const { data } = await chatService.joinRoom(inviteCode.trim());
      if (data.message === "Already a member") {
        alert("You are already a member of this group!");
      }
      onJoined(data.room);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to join room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-bg-secondary w-full max-w-md rounded-2xl shadow-2xl border border-white/10 p-6 animate-fade-in-up">
        <h2 className="text-xl font-bold mb-4">Join Private Group</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Invitation Code
            </label>
            <input
              type="text"
              className="input-field w-full text-center tracking-widest text-lg uppercase"
              placeholder="e.g. A1B2C3"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-text-secondary hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !inviteCode}
              className="btn btn-primary"
            >
              {loading ? "Joining..." : "Join Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinRoomModal;
