import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const backendPort = Number(process.env.BACKEND_PORT) || 5000;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "..", "backend", "src", "shared"),
      "@assets": path.resolve(__dirname, "..", "attached_assets"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/api": {
        target: `http://localhost:${backendPort}`,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  publicDir: "public",
});
