import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Avatar from "./Avatar";
import JoinRoomModal from "./JoinRoomModal";

const Sidebar = ({ rooms, currentRoom, onJoinRoom, onAddRoom, onNewChat }) => {
  const { user, logout } = useAuth();
  const [showJoinModal, setShowJoinModal] = useState(false);

  const groups = rooms.filter((r) => r.type !== "direct");
  const dms = rooms.filter((r) => r.type === "direct");

  const RoomItem = ({ room }) => (
    <div
      onClick={() => onJoinRoom(room)}
      className={`
        px-4 py-3 rounded-2xl cursor-pointer mb-2 transition-all duration-300 flex items-center gap-3 group
        ${
          currentRoom?.id === room.id
            ? "bg-gradient-to-r from-accent to-purple-600 text-white shadow-lg shadow-accent/20"
            : "hover:bg-white/5 text-text-secondary hover:text-white"
        }
      `}
    >
      <Avatar
        url={room.avatar_url}
        name={room.name}
        size="md"
        className="group-hover:border-white/30 transition-colors"
      />

      <div className="truncate font-medium text-sm flex-1">
        {room.name || "Unknown"}
      </div>
      {/* Unread Badge */}
      {room.unread_count > 0 && (
        <span className="min-w-[1.2rem] h-[1.2rem] flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full px-1">
          {room.unread_count}
        </span>
      )}
      {room.members_count > 0 &&
        room.type !== "direct" &&
        room.unread_count === 0 && (
          <span className="text-[10px] opacity-60 bg-black/20 px-2 py-0.5 rounded-full">
            {room.members_count}
          </span>
        )}
    </div>
  );

  return (
    <div className="w-full md:w-[280px] bg-bg-secondary/95 backdrop-blur-xl border-r border-white/5 flex flex-col h-screen relative overflow-hidden">
      {/* Glow config */}
      <div className="absolute top-0 left-0 w-full h-[200px] bg-accent/5 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />

      <div className="p-6 pb-2 z-10">
        <h2 className="m-0 text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-2">
          FamilyChat
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        </h2>
        <div className="mt-1 text-xs text-text-secondary/70 font-medium tracking-wide">
          Logged in as <span className="text-accent">{user?.username}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar z-10 space-y-6">
        {/* GROUPS */}
        <div>
          <div className="flex justify-between items-center mb-3 px-2">
            <h3 className="text-[11px] uppercase text-text-secondary/50 font-bold tracking-widest">
              My Groups
            </h3>
            <div className="flex gap-1">
              <button
                onClick={() => setShowJoinModal(true)}
                className="text-text-secondary hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg text-xs font-semibold px-2 border border-white/5"
                title="Join via Code"
              >
                JOIN
              </button>
              <button
                onClick={onAddRoom}
                className="text-text-secondary hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                title="Create New Group"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="space-y-1">
            {groups.map((room) => (
              <RoomItem key={room.id} room={room} />
            ))}
          </div>
        </div>

        {/* DIRECT MESSAGES */}
        <div>
          <div className="flex justify-between items-center mb-3 px-2">
            <h3 className="text-[11px] uppercase text-text-secondary/50 font-bold tracking-widest">
              Direct Messages
            </h3>
            <button
              onClick={onNewChat}
              className="text-text-secondary hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
              title="New Message"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </button>
          </div>
          <div className="space-y-1">
            {dms.map((room) => (
              <RoomItem key={room.id} room={room} />
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-black/20 backdrop-blur-md z-10 border-t border-white/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-accent to-purple-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-bg-primary flex items-center justify-center overflow-hidden">
                <Avatar
                  url={user?.avatar_url}
                  name={user?.username}
                  size="full"
                  className="w-full h-full rounded-none border-none"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white leading-tight">
                {user?.username}
              </span>
              <span className="text-[10px] text-green-400">Online</span>
            </div>
          </div>
          <Link
            to="/profile"
            className="text-text-secondary hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </Link>
        </div>
        <button
          onClick={logout}
          className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-text-secondary hover:text-red-400 transition-all border border-white/5 hover:border-white/10"
        >
          Sign Out
        </button>
      </div>
      {showJoinModal && (
        <JoinRoomModal
          onClose={() => setShowJoinModal(false)}
          onJoined={(room) => {
            setShowJoinModal(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default Sidebar;
