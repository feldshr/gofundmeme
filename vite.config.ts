import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { tanstackRouter } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 4MB
      },
      injectRegister: "auto",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "logo.svg"],
      manifest: {
        name: "GoFundMeme",
        short_name: "GFM",
        description: "GoFundMeme",
        theme_color: "#eee",
        background_color: "#121216",
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
    nodePolyfills(),
    tanstackRouter(),
  ],
});
