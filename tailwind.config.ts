import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f3f1ff",
          100: "#e9e5ff",
          200: "#d5ceff",
          300: "#b5a7ff",
          400: "#9177ff",
          500: "#6f47fb",
          600: "#5b2bf0",
          700: "#4c1fd6",
          800: "#3f1bae",
          900: "#35198e",
        },
        accent: { 400: "#ffc24d", 500: "#f5a524", 600: "#d98a0b" },
        ink: { DEFAULT: "#14121f", soft: "#2a2738" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
