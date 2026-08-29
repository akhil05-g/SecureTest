import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0e1a",
        surface: "#111827",
        accent: "#3b82f6",
        danger: "#ef4444",
        warning: "#f59e0b",
        success: "#10b981",
      },
    },
  },
  plugins: [],
};
export default config;