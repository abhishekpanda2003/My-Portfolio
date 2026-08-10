import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves this repo at /My-Portfolio/, so the base must match.
// If you deploy on Vercel instead (root domain), change base back to "/".
export default defineConfig({
  plugins: [react()],
  // Use a relative base so the build works from root or a subpath.
  // Override with VITE_BASE if you need a fixed subdirectory for GitHub Pages.
  base: process.env.VITE_BASE || "./",
});
