import React, { useEffect, useState } from "react";
import { chatService } from "../services/api";
import { useNavigate, Link } from "react-router-dom";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await chatService.getProfile();
      setUser(data);
      setBio(data.bio || "");
      setAvatarUrl(data.avatar_url || "");
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

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
      alert("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    if (status.message) {
      const timer = setTimeout(() => {
        setStatus({ type: "", message: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: "", message: "" });
    try {
      const { data } = await chatService.updateProfile({
        bio,
        avatar_url: avatarUrl,
      });
      setUser(data);
      setStatus({ type: "success", message: "Profile updated successfully!" });
      setTimeout(() => {
        navigate("/chat");
      }, 1500);
    } catch (error) {
      console.error("Failed to update profile", error);
      setStatus({ type: "error", message: "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="p-8 text-text-primary">Loading profile...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto text-text-primary">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">User Profile</h1>
        <Link
          to="/chat"
          className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Chat
        </Link>
      </div>

      <div className="bg-bg-secondary p-6 rounded-lg shadow-md border border-bg-tertiary">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-bg-tertiary mb-4 overflow-hidden relative group">
            {avatarUrl ? (
              <img
                src={
                  avatarUrl.startsWith("http")
                    ? avatarUrl
                    : `http://localhost:3000${avatarUrl}`
                }
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-text-secondary">
                {user?.username?.charAt(0).toUpperCase()}
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
          <h2 className="text-xl font-semibold">{user?.username}</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Bio
            </label>
            <textarea
              className="input-field w-full h-24 resize-none"
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {status.message && (
            <div
              className={`p-3 rounded text-sm ${
                status.type === "success"
                  ? "bg-green-500/20 text-green-400 border border-green-500/50"
                  : "bg-red-500/20 text-red-400 border border-red-500/50"
              }`}
            >
              {status.message}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving || uploading}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
