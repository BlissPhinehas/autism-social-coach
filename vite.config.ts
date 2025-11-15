import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  // Serve static files from public directory
  publicDir: "public",
  build: {
    // Copy public/index.html to dist/index.html
    rollupOptions: {
      input: "public/index.html"
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
