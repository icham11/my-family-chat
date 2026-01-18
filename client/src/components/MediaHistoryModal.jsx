import React, { useEffect, useState } from "react";
import { chatService } from "../services/api";

const MediaHistoryModal = ({ roomId, onClose }) => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const { data } = await chatService.getRoomMedia(roomId);
        setMedia(data);
      } catch (err) {
        console.error("Failed to fetch media", err);
      } finally {
        setLoading(false);
      }
    };
    if (roomId) fetchMedia();
  }, [roomId]);

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-bg-secondary w-full max-w-4xl max-h-[80vh] rounded-lg flex flex-col border border-bg-tertiary"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-bg-tertiary flex justify-between items-center">
          <h2 className="text-xl font-bold text-text-primary">Media History</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center text-text-secondary">Loading...</div>
          ) : media.length === 0 ? (
            <div className="text-center text-text-secondary">
              No media shared yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {media.map((item) => (
                <div
                  key={item.id}
                  className="aspect-square bg-black/20 rounded overflow-hidden relative group"
                >
                  {item.type === "video" ? (
                    <video
                      src={
                        item.attachment_url.startsWith("http")
                          ? item.attachment_url
                          : `http://localhost:3000${item.attachment_url}`
                      }
                      className="w-full h-full object-cover"
                      controls={false}
                    />
                  ) : (
                    <img
                      src={
                        item.attachment_url.startsWith("http")
                          ? item.attachment_url
                          : `http://localhost:3000${item.attachment_url}`
                      }
                      alt="Shared media"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <a
                    href={
                      item.attachment_url.startsWith("http")
                        ? item.attachment_url
                        : `http://localhost:3000${item.attachment_url}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-medium transition-opacity"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaHistoryModal;
