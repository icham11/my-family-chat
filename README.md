# My Family Chat 💬

![Project Banner](https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2664&auto=format&fit=crop)

**My Family Chat** is a modern, feature-rich real-time messaging application designed for seamless family communication. Built with **React** and **Node.js**, it offers a premium user experience with live socket updates, multimedia sharing, group management, and secure authentication.

🔗 **Live Demo:** [https://family-chat-99.web.app](https://family-chat-99.web.app)

---

## ✨ Features

- **🔐 Secure Authentication**:
  - username/password login
  - **Google OAuth 2.0** integration
  - JSON Web Token (JWT) secured sessions

- **💬 Real-Time Messaging**:
  - Instant message delivery via **Socket.IO**
  - Typing indicators & Read status
  - Emoji reactions & Message replies/forwarding

- **📸 Rich Media Support**:
  - **Integrated Camera**: Capture photos & videos (max 45s) directly in-app
  - **File Uploads**: Drag-and-drop support for images and videos via **ImageKit**
  - **Link Previews**: Automatic rich previews for shared links

- **👥 Advanced Group Management**:
  - **Private Groups**: Join via exclusive **Invitation Codes**
  - **Direct Adding**: Add members directly by username
  - **Role-Based Access**: Admins can edit/delete rooms

- **🎨 Premium UI/UX**:
  - Responsive "Glassmorphism" design
  - Dark mode aesthetic with amber/gold accents
  - Smooth transitions and interactive elements

---

## 🛠 Tech Stack

### Frontend

- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (Context API)
- **Icons**: Heroicons
- **Hosting**: Firebase Hosting

### Backend

- **Runtime**: Node.js & Express.js
- **Database**: PostgreSQL (Sequelize ORM)
- **Real-Time Engine**: Socket.IO
- **Storage**: ImageKit (Cloud Object Storage)
- **Authentication**: Passport.js (Google Strategy) & JWT
- **Deployment**: AWS EC2 with Nginx & PM2

---

## 🚀 Installation

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- ImageKit Account
- Google Cloud Console Project (for OAuth)

### 1. Clone the Repository

```bash
git clone https://github.com/icham11/my-family-chat.git
cd my-family-chat
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/family_chat
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=your_endpoint
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Run migrations and start server:

```bash
npx sequelize-cli db:migrate
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
```

Run development server:

```bash
npm run dev
```

---

## 📚 API Documentation

### Authentication (`/api/auth`)

| Method | Endpoint    | Description                  |
| :----- | :---------- | :--------------------------- |
| `POST` | `/register` | Register a new user          |
| `POST` | `/login`    | Login with username/password |
| `GET`  | `/google`   | Initiate Google OAuth flow   |
| `GET`  | `/me`       | Get current user's profile   |

### Users (`/api/user`)

| Method | Endpoint   | Description                                |
| :----- | :--------- | :----------------------------------------- |
| `GET`  | `/profile` | Get user profile details                   |
| `PUT`  | `/profile` | Update bio or avatar                       |
| `GET`  | `/search`  | Search users by username query (`?q=name`) |

### Chat & Rooms (`/api/chat`)

| Method | Endpoint                | Description                        |
| :----- | :---------------------- | :--------------------------------- |
| `GET`  | `/rooms`                | List all rooms user is member of   |
| `POST` | `/room`                 | Create a new group room            |
| `POST` | `/rooms/dm`             | Create/Get Direct Message room     |
| `POST` | `/rooms/join`           | Join a group using **Invite Code** |
| `POST` | `/room/:roomId/members` | Add a member by username           |
| `GET`  | `/:roomId`              | Get message history for a room     |
| `GET`  | `/room/:roomId/media`   | Get shared media (photos/videos)   |

### Uploads (`/api/upload`)

| Method | Endpoint | Description                           |
| :----- | :------- | :------------------------------------ |
| `POST` | `/`      | Upload file to ImageKit (returns URL) |

---

## 🔒 Security Measures

- **GIT Push Protection**: Sensitive secrets (like `.env`) are blocked from being pushed to repositories.
- **CORS Configuration**: Strict allowlist for frontend domains.
- **Password Hashing**: Bcrypt is used for secure password storage.
- **JWT Authentication**: Stateless authentication for API endpoints.

---

## 👤 Author

**Wahid Nurhisyam**  
Fullstack Developer  
[GitHub Profile](https://github.com/icham11)
