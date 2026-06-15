import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#F6F7FB",
        "background-elevated": "#FFFFFF",
        surface: "#FFFFFF",
        "surface-hover": "#EEF2F7",
        "surface-active": "#E2E8F2",
        "surface-subtle": "#EEF2F7",
        "surface-inverse": "#0B1020",
        border: "#DCE3EC",
        "border-strong": "#B8C2D1",
        foreground: "#0F172A",
        "foreground-muted": "#64748B",
        "text-on-inverse": "#F8FAFC",
        primary: "#5B5BD6",
        "primary-foreground": "#FFFFFF",
        "primary-hover": "#4F46E5",
        "primary-soft": "#ECECFF",
        secondary: "#0B1020",
        "secondary-foreground": "#F8FAFC",
        accent: "#0891B2",
        "accent-foreground": "#FFFFFF",
        "focus-ring": "#6366F1",
        success: "#15803D",
        warning: "#B45309",
        danger: "#B91C1C",
        info: "#2563EB",
        overlay: "rgba(15,23,42,0.55)",
        skeleton: "#EEF2F7",
        "code-background": "#0B1020",
        "chart-grid": "#D8DEE9",
        ctos: {
          bg: "#FFFFFF",
          panel: "#FFFFFF",
          border: "#DCE3EC",
          accent: "#5B5BD6",
          accentDim: "#4F46E5",
          warn: "#B45309",
          ok: "#15803D",
          info: "#2563EB",
        },
        brand: {
          orange: "#5B5BD6",
          "orange-dim": "#4F46E5",
          purple: "#0B1020",
          "purple-dim": "#334155",
          yellow: "#0891B2",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        "elev-1": "0 1px 2px rgba(15,23,42,0.06)",
        "elev-2": "0 8px 24px rgba(15,23,42,0.10)",
        glow: "0 0 0 3px rgba(99,102,241,0.20)",
      },
    },
  },
  plugins: [],
};

export default config;
