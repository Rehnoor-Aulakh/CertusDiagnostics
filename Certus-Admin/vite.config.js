import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // Fixed port for admin panel
    host: true,
    proxy: {
      '/api': {
        target: 'http://backend:8080',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://backend:8080',
        changeOrigin: true
      }
    }
  },
});
