import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "network-canvas": ["@xyflow/react"],
          motion: ["motion/react"],
          react: ["react", "react-dom", "zustand"],
        },
      },
    },
  },
  test: { include: ["src/**/*.test.ts"] },
});
