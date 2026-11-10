import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    proxy: {
      /* The API server in backend/. Proxying it means the dev site and the
       * API share an origin, so there is no CORS round trip and no base URL
       * to configure. For a deployed build pointing at another host, set
       * VITE_API_URL instead - see src/lib/api.js. */
      "/api": {
        target: process.env.VITE_API_PROXY ?? "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
