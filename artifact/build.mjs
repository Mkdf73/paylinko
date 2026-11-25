// Construit dist/paylinko-artifact.html : toute l'app dans un seul fichier HTML.
import { build } from "esbuild";
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

mkdirSync("dist", { recursive: true });
execSync("npx tailwindcss -c artifact/tailwind.artifact.config.cjs -i app/globals.css -o dist/artifact.css --minify", { stdio: "inherit" });
await build({
  entryPoints: ["artifact/entry.tsx"],
  bundle: true,
  minify: true,
  format: "iife",
  outfile: "dist/artifact.js",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  alias: { "next/link": "./artifact/shims/next-link.tsx", "next/navigation": "./artifact/shims/next-navigation.ts" },
  logLevel: "warning",
});
const css = readFileSync("dist/artifact.css", "utf8");
const js = readFileSync("dist/artifact.js", "utf8").replace(/<\/script/gi, "<\\/script");
const html = `<title>Paylinko</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap">
<style>:root{color-scheme:light}html,body{background:#ffffff;color:#0f172a}${css}</style>
<div id="root"></div>
<script>${js}</script>
`;
writeFileSync("dist/paylinko-artifact.html", html);
console.log("dist/paylinko-artifact.html", (html.length / 1024).toFixed(0) + " Ko");
