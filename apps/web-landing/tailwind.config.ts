import type { Config } from "tailwindcss";

// Design system TamsHub ClaudProx — Contrasting Vibrancy (shared dengan dashboard/admin).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#181818",
        "background-elevated": "#1f1f1f",
        surface: "#1f1f1f",
        "surface-hover": "#262626",
        "surface-active": "#2e2e2e",
        border: "#333333",
        "border-strong": "#4d4d4d",
        foreground: "#F7F7F7",
        "foreground-muted": "#a1a1aa",
        primary: "#FF5722",
        "primary-foreground": "#181818",
        secondary: "#673AB7",
        "secondary-foreground": "#F7F7F7",
        accent: "#FFEB3B",
        "accent-foreground": "#181818",
        "focus-ring": "#FFEB3B",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        info: "#673AB7",
        overlay: "rgba(0,0,0,0.6)",
        skeleton: "#262626",
        ctos: {
          bg: "#181818",
          panel: "#1f1f1f",
          border: "#333333",
          accent: "#FF5722",
          accentDim: "#e64a19",
          warn: "#f59e0b",
        },
        brand: {
          orange: "#FF5722",
          "orange-dim": "#e64a19",
          purple: "#673AB7",
          "purple-dim": "#5e35b1",
          yellow: "#FFEB3B",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        "elev-1": "0 1px 2px rgba(0,0,0,0.4)",
        "elev-2": "0 4px 16px rgba(0,0,0,0.5)",
        glow: "0 0 24px rgba(255,87,34,0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
