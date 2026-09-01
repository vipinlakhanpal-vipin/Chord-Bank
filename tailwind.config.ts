import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: "#FF9933",
        teal: "#0EA5A0",
        magenta: "#D6336C",
        indigo: "#4338CA",
        cream: "#FFF8EE",
        ink: "#1F2430",
      },
      fontFamily: {
        display: ["ui-rounded", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
