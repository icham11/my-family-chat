import React from "react";

const ForwardModal = ({ isOpen, onClose, rooms, onForward }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg-secondary p-6 rounded-lg w-96 shadow-xl border border-bg-tertiary">
        <h3 className="text-xl font-semibold mb-4 text-text-primary">
          Forward to...
        </h3>
        <div className="max-h-60 overflow-y-auto mb-4">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => onForward(room.id)}
              className="w-full text-left px-4 py-3 rounded-md hover:bg-bg-tertiary text-text-primary transition-colors mb-1"
            >
              # {room.name}
            </button>
          ))}
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForwardModal;
