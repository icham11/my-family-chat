# Deployment Guide

This guide explains how to deploy the **Family Chat** application (Server & Client).

## Prerequisites

- For **Production**, you typically need a cloud provider (e.g., Render, Railway, Heroku, or a VPS).
- A PostgreSQL Database hosted online (e.g., Neon, Supabase, or Render's DB).

## 1. Server Deployment (Node.js + PostgreSQL)

### Environment Variables

Set the following environment variables on your server:

```env
PORT=3000
JWT_SECRET=your_secure_random_secret
CLIENT_URL=https://your-frontend-domain.com
IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_PRIVATE_KEY=...
IMAGEKIT_URL_ENDPOINT=...
DATABASE_URL=postgres://user:pass@host:port/dbname
NODE_ENV=production
```

### Database Configuration

The code now uses `server/config/config.json`.

- In `production` mode, it looks for the `DATABASE_URL` environment variable automatically.
- Ensure your database URL is correct.

### Start Command

Your host will typically run:

```bash
npm start
```

This runs `node index.js`.

## 2. Client Deployment (Vite + React)

### Build the Client

1. Navigate to the client folder:
   ```bash
   cd client
   ```
2. Build the static files:
   ```bash
   npm run build
   ```
   This creates a `dist/` folder containing your website.

### Configuration

Update your client to point to your production server URL.
Currently, `client/src/services/api.js` points to `http://localhost:3000`.
**Action Required**: You should update this to use an environment variable.

1. Create/Update `client/.env.production`:
   ```env
   VITE_API_URL=https://your-backend-domain.com/api
   ```
2. Update `client/src/services/api.js`:
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
   ```

### Hosting

Upload the `dist/` folder to any static host (Netlify, Vercel, GitHub Pages, etc.).

- **Netlify/Vercel**: Usually you just connect your Git repo and set the build command to `npm run build` and output dir to `dist`.

## 3. Database Migration

Since we are using Sequelize, you might want to run migrations in production.
Currently, the app uses `sequelize.sync()` in development implicitly via usage, or you can use the CLI:

```bash
npx sequelize-cli db:migrate
```

(You would need to create migration files first using `npx sequelize-cli migration:generate ...` if you want strictly versioned migrations).
