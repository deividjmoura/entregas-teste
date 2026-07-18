/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--color-bg) / <alpha-value>)",
        panel: "rgb(var(--color-panel) / <alpha-value>)",
        "panel-border": "rgb(var(--color-panel-border) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        dim: "rgb(var(--color-dim) / <alpha-value>)",
        urgent: "#F2B705",
        critical: "#E8552F",
        parada: "#FF1F4B",
        progress: "#3EC1D3",
        success: "#4CAF6D",
        cancel: "#6B7280",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      keyframes: {
        "pulse-led": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "pulse-led": "pulse-led 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};  