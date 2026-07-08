import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  alias: {
    "@": "src/",
  },
  manifest: () => ({
    name: "Scrape Essentials",
    description: "__MSG_extDescription__",
    version: "0.2.9",
    permissions: ["activeTab", "identity", "storage", "scripting", "alarms"],
    host_permissions: ["<all_urls>"],
    default_locale: "en",
  }),
  vite: () => ({
    build: {
      chunkSizeWarningLimit: 10 * 1024 * 1024, // 10MB
    },
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }),
});
