import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves this repo at /My-Portfolio/, so the base must match.
// If you deploy on Vercel instead (root domain), change base back to "/".
export default defineConfig({
  plugins: [react()],
  base: "/My-Portfolio/",
});
