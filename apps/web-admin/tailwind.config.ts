import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ctos: {
          bg: "#05070a",
          panel: "#0b0f15",
          border: "#1b2733",
          // Admin pakai aksen merah CtOS untuk membedakan dari user dashboard.
          accent: "#ef4444",
          accentDim: "#b91c1c",
          warn: "#ffb000",
          ok: "#22c55e",
          info: "#00e5ff",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
