// Bundles the extension into ./dist (load that folder in chrome://extensions).
// Chrome extensions may not load code from the internet, so the Firebase SDK is bundled.
import { build } from "esbuild";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";

// Share one copy of the sealing rules with the web app.
mkdirSync("shared", { recursive: true });
for (const f of ["redact.js", "health.js"]) if (existsSync(`../web/js/${f}`)) cpSync(`../web/js/${f}`, `shared/${f}`);

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist");
cpSync("static", "dist", { recursive: true });
await build({ entryPoints: ["src/content.js"], bundle: true, format: "iife", outfile: "dist/content.js", target: "chrome138", minify: true });
await build({ entryPoints: ["src/background.js", "src/offscreen.js", "src/popup.js"], bundle: true, format: "esm", outdir: "dist", target: "chrome138", minify: true });
console.log("Built extension into dist/");
