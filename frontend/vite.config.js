import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    https: true,
    host: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    basicSsl({
      name: "test",
      domains: ["localhost", "10.1.117.200", "192.168.1.4"],
    }),
  ],
  base: "tlc-38-event-manager",
});
