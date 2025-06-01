// @ts-check
import { defineConfig, envField } from "astro/config";
import { fileURLToPath } from "url";
import path from "path";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap()],
  server: { port: 3000 },
  env: {
    schema: {
      // Public variables (available on client and server)
      PUBLIC_SUPABASE_URL: envField.string({
        context: "client",
        access: "public",
      }),
      PUBLIC_SUPABASE_KEY: envField.string({
        context: "client",
        access: "public",
      }),

      // Private variables (server-side only)
      PRIVATE_OPENROUTER_API_KEY: envField.string({
        context: "server",
        access: "public",
      }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        ...(import.meta.env.PROD
          ? {
              "react-dom/server": "react-dom/server.edge",
            }
          : {}),
      },
    },
    optimizeDeps: {
      exclude: ["msw"],
    },
    ssr: {
      noExternal: ["msw"],
    },
    define: {
      global: "globalThis",
    },
  },
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  experimental: { session: true },
});
