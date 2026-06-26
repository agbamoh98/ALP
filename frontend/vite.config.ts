import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api/auth": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
      "/api/resources": {
        target: "http://localhost:8082",
        changeOrigin: true,
      },
      "/api/ai": {
        target: "http://localhost:8083",
        changeOrigin: true,
      },
      "/api/quizzes": {
        target: "http://localhost:8084",
        changeOrigin: true,
      },
      "/api/flashcards": {
        target: "http://localhost:8085",
        changeOrigin: true,
      },
      "/api/progress": {
        target: "http://localhost:8086",
        changeOrigin: true,
      },
    },
  },
});
