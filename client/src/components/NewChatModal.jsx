import React, { useState } from "react";
import { chatService } from "../services/api";
import Avatar from "./Avatar";

const NewChatModal = ({ onClose, onChatCreated }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 1) {
      setLoading(true);
      try {
        const { data } = await chatService.searchUsers(term);
        setResults(data);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    } else {
      setResults([]);
    }
  };

  const startChat = async (userId) => {
    try {
      const { data } = await chatService.createDirectRoom(userId);
      onChatCreated(data); // Callback to refresh rooms and switch to new chat
      onClose();
    } catch (err) {
      console.error("Failed to start chat", err);
      alert("Failed to start chat");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-bg-primary w-full max-w-md rounded-2xl p-6 shadow-2xl border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">
            New Chat
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full bg-bg-tertiary text-text-primary px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent transition-all pl-10"
            autoFocus
          />
          <svg
            className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="text-center text-text-secondary py-4">
              Searching...
            </div>
          ) : results.length > 0 ? (
            results.map((user) => (
              <button
                key={user.id}
                onClick={() => startChat(user.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-bg-tertiary rounded-xl transition-colors group"
              >
                <div className="w-10 h-10 rounded-full flex-shrink-0">
                  <Avatar
                    url={user.avatar_url}
                    name={user.username}
                    size="md"
                  />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-text-primary group-hover:text-white transition-colors">
                    {user.username}
                  </div>
                </div>
              </button>
            ))
          ) : searchTerm.length > 1 ? (
            <div className="text-center text-text-secondary py-4">
              No users found
            </div>
          ) : (
            <div className="text-center text-text-secondary py-4 text-sm">
              Type to search for friends
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
