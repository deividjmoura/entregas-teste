/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#14181B",
        panel: "#1B2024",
        "panel-border": "#2A3136",
        ink: "#EDEFF1",
        dim: "#9BA5AA",
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