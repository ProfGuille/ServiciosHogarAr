import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const backendPort = Number(process.env.BACKEND_PORT) || 5000;

export default defineConfig({
  plugins: [react()],
  base: "./", // Use relative paths for deployment
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
    // Bundle optimization
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for large libraries
          vendor: ['react', 'react-dom', 'wouter'],
          // UI library chunk
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', 'lucide-react'],
          // Charts and data visualization
          charts: ['chart.js', 'react-chartjs-2', 'recharts'],
          // Maps and location
          maps: ['leaflet', 'react-leaflet'],
          // PWA and utilities
          utils: ['date-fns', 'zod', 'clsx', 'tailwind-merge']
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    }
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
