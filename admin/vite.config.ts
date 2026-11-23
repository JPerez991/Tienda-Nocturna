import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Panel administrativo: app independiente de la tienda.
// Corre en 5174 para poder tener tienda (5173) y panel abiertos a la vez.
// Proxy /api y /health al backend para que la cookie httpOnly de sesión sea
// same-origin en desarrollo.
const API_TARGET = process.env.VITE_API_PROXY ?? "http://localhost:8080";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    proxy: {
      "/api": { target: API_TARGET, changeOrigin: false },
      "/health": { target: API_TARGET, changeOrigin: false },
    },
  },
});
