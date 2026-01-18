module.exports = {
  apps: [
    {
      name: "family-chat-server",
      cwd: "./server",
      script: "index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        // You can add other env vars here or keep them in server/.env
        DATABASE_URL:
          "postgresql://postgres:KxdvhUBtuXCXdhDMsmhTAjZgeGfnxRPe@switchback.proxy.rlwy.net:23635/railway",
      },
    },
  ],
};
