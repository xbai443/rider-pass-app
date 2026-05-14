/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,vue}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0a0a0a',
          card: '#18181b',
          hover: '#27272a',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        accent: {
          DEFAULT: '#3b82f6',
          green: '#4ade80',
          yellow: '#facc15',
          orange: '#f97316',
          red: '#ef4444',
        },
      },
    },
  },
  plugins: [],
};