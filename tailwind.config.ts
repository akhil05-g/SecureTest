import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#020617", // Slate-950
        card: "#0f172a", // Slate-900
        safe: {
          DEFAULT: "#10b981", // Emerald-500
          500: "#10b981",
        },
        suspicious: {
          DEFAULT: "#f59e0b", // Amber-500
          500: "#f59e0b",
        },
        danger: {
          DEFAULT: "#e11d48", // Rose-600
          600: "#e11d48",
        },
        accent: {
          DEFAULT: "#06b6d4", // Cyan-500
          500: "#06b6d4",
        },
        cyber: {
          bg: "#020617",
          card: "#0f172a",
          safe: "#10b981",
          suspicious: "#f59e0b",
          danger: "#e11d48",
          accent: "#06b6d4",
        },
      },
      boxShadow: {
        "glow-cyan": "0 0 15px -3px rgba(6, 182, 212, 0.4)",
        "glow-emerald": "0 0 15px -3px rgba(16, 185, 129, 0.4)",
        "glow-amber": "0 0 15px -3px rgba(245, 158, 11, 0.4)",
        "glow-rose": "0 0 15px -3px rgba(225, 29, 72, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
