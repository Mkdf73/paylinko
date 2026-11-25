const base = require("../tailwind.config.ts");
module.exports = { ...(base.default ?? base), content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./artifact/**/*.{ts,tsx}"] };
