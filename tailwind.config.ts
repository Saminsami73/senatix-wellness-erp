import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#080710",
          obsidian: "#0b0c10",
          surface: "#15161c",
          card: "#1b1c20",
          border: "#252628",
          muted: "#35383d",
          teal: "#053B44",
          emerald: "#10b981",
          gold: "#f59e0b",
        },
        pastel: {
          mint: "#E8F5F1",
          peach: "#FBECE4",
          coral: "#F9D8D6",
          lavender: "#DCD6F7",
          sage: "#D8E2DC",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
      animation: {
        "pulse-subtle": "pulseSubtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.2s ease-out forwards",
      },
      keyframes: {
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "scale(0.98)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
