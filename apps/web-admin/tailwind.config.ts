import type { Config } from "tailwindcss";

// Design system TamsHub ClaudProx — Branded SaaS Neutral (Octet palette).
// Light-first, tenang, enterprise. Sumber kebenaran enam warna Octet:
//   #ebedf1 Bright Grey, #d4d8df Shy Blunt, #acadb1 Grey Timber Wolf,
//   #706f70 Smoked Pearl, #353536 Jet Black, #080808 Reversed Grey.
// Admin memakai palette inti yang sama; pembeda peran hanya badge [ADMIN] di nav.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#e8eaef",
        "background-elevated": "#ebedf1",
        surface: "#ebedf1",
        "surface-hover": "#d4d8df",
        "surface-active": "#c8cbd1",
        border: "#acadb1",
        "border-strong": "#706f70",
        foreground: "#080808",
        "foreground-muted": "#5b5a5b",
        primary: "#080808",
        "primary-foreground": "#ebedf1",
        secondary: "#353536",
        "secondary-foreground": "#ebedf1",
        accent: "#353536",
        "accent-foreground": "#ebedf1",
        "focus-ring": "#080808",
        success: "#15803d",
        warning: "#b45309",
        danger: "#b91c1c",
        info: "#353536",
        overlay: "rgba(8,8,8,0.55)",
        skeleton: "#d4d8df",
        ctos: {
          bg: "#ebedf1",
          panel: "#ebedf1",
          border: "#acadb1",
          accent: "#080808",
          accentDim: "#353536",
          warn: "#b45309",
          ok: "#15803d",
          info: "#353536",
        },
        brand: {
          orange: "#080808",
          "orange-dim": "#353536",
          purple: "#353536",
          "purple-dim": "#706f70",
          yellow: "#353536",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        "elev-1": "0 1px 2px rgba(8,8,8,0.08)",
        "elev-2": "0 4px 16px rgba(8,8,8,0.12)",
        glow: "0 0 0 1px rgba(8,8,8,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
