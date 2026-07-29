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
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        urgent: "#F59E0B",
        critical: "#EF4444",
        parada: "#DC2626",
        progress: "#3B82F6",
        success: "#22C55E",
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
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)",
        "soft-md": "0 4px 12px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
        "soft-lg": "0 12px 32px -8px rgb(0 0 0 / 0.12), 0 4px 8px -4px rgb(0 0 0 / 0.06)",
        premium: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)",
        "premium-sm": "0 1px 2px 0 rgb(0 0 0 / 0.04)",
      },
      keyframes: {
        "pulse-led": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "pulse-led": "pulse-led 1.6s ease-in-out infinite",
        "fade-in": "fade-in 0.25s ease-out",
        shimmer: "shimmer 1.8s linear infinite",
      },
    },
  },
  plugins: [],
};
