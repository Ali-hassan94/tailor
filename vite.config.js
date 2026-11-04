import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "./", // APK ke andar relative paths chahiye
  plugins: [react(), tailwindcss()],
});
