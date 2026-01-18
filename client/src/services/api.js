import axios from "axios";

export const SERVER_URL = "https://api.surgamenginap.site";
export const API_URL = `${SERVER_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (username, password) =>
    api.post("/auth/login", { username, password }),
  register: (username, password) =>
    api.post("/auth/register", { username, password }),
  getMe: () => api.get("/auth/me"),
};

export const chatService = {
  getHistory: (roomId) => api.get(`/chat/${roomId}`),
  getRooms: () => api.get("/chat/rooms"),
  createDirectRoom: (targetUserId) =>
    api.post("/chat/rooms/dm", { targetUserId }),
  joinRoom: (inviteCode) => api.post("/chat/rooms/join", { inviteCode }),
  searchUsers: (q) => api.get("/user/search", { params: { q } }),
  uploadImage: (formData) =>
    api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getProfile: () => api.get("/user/profile"),
  updateProfile: (data) => api.put("/user/profile", data),
  createRoom: (data) => api.post("/chat/room", data),
  getRoomDetails: (roomId) => api.get(`/chat/room/${roomId}`),
  getRoomMedia: (roomId) => api.get(`/chat/room/${roomId}/media`),
  updateRoom: (roomId, data) => api.put(`/chat/room/${roomId}`, data),
  deleteRoom: (roomId) => api.delete(`/chat/room/${roomId}`),
  getLinkPreview: (url) =>
    api.get(`/chat/utils/link-preview`, { params: { url } }),
};

export default api;
