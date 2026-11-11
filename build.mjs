import { build } from "esbuild";

await build({
  entryPoints: ["src/main.js"],
  bundle: true,
  minify: true,
  format: "iife",
  target: "chrome90",
  outfile: "www/app.js",
  logLevel: "info"
});
