import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
       target: "https://api.journita.ai",  // ← your backend URL
        changeOrigin: true,
        secure: true,
      },
    },
  },
});