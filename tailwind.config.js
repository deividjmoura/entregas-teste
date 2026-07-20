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
        "card-ink": "var(--card-ink)",
        "card-dim": "var(--card-dim)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        "accent-2": "rgb(var(--color-accent-2) / <alpha-value>)",
        "surface-2": "rgb(var(--color-surface-2) / <alpha-value>)",
        "sidebar-bg": "rgb(var(--color-sidebar-bg) / <alpha-value>)",
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
      boxShadow: {
        premium: "0 20px 40px -15px rgba(0,0,0,0.45)",
        "premium-sm": "0 8px 20px -8px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};