import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

/** Config de Vitest separada de vite.config.ts (no afecta al build). */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    restoreMocks: true,
  },
});
