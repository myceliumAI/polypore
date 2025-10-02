import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  // Use a project-local cache directory to avoid permission issues from
  // root-owned node_modules/.vite created by containers.
  cacheDir: path.resolve(__dirname, ".vite"),
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@lib": path.resolve(__dirname, "./src/lib"),
    },
  },
});
