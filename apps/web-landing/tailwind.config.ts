import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tema CtOS / hacker: dasar gelap dengan aksen cyan.
        ctos: {
          bg: "#05070a",
          panel: "#0b0f15",
          border: "#1b2733",
          accent: "#00e5ff",
          accentDim: "#0891a8",
          warn: "#ffb000",
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
