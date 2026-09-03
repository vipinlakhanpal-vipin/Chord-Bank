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
        turquoise: "#40E0D0",
        cream: "#FFF8EE",
        ink: "#1F2430",
      },
      fontFamily: {
        sans: ["Nunito", "system-ui", "sans-serif"],
        display: ["Nunito", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
