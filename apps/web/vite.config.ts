import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const config = defineConfig({
  plugins: [
    cloudflare(),
    devtools(),
    tailwindcss(),
    tanstackRouter({
      autoCodeSplitting: true,
      routeFileIgnorePattern: "(^|/)components(/|$)",
      target: "react"
    }),
    viteReact()
  ],
  resolve: {
    tsconfigPaths: true
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        changeOrigin: true,
        target: "http://localhost:3100"
      }
    }
  }
});

export default config;
