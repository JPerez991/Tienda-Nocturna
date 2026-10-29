import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// El backend corre en http://localhost:8080 (ver backend/src/config/env.ts, PORT).
// En dev proxyamos /api y /health al backend para que las cookies httpOnly
// (token) sean same-origin y no choquemos con CORS.
const API_TARGET = process.env.VITE_API_PROXY ?? "http://localhost:8080";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: API_TARGET, changeOrigin: false },
      "/health": { target: API_TARGET, changeOrigin: false },
    },
  },
});
