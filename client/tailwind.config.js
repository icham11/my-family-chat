/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0f172a",
          secondary: "#1e293b",
          tertiary: "#334155",
        },
        text: {
          primary: "#f8fafc",
          secondary: "#94a3b8",
        },
        accent: {
          DEFAULT: "#3b82f6",
          hover: "#2563eb",
        },
        danger: "#ef4444",
        success: "#22c55e",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
