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
    description: "A browser extension for web scraping and automation.",
    version: "0.1.8",
    permissions: ["activeTab", "identity", "storage", "scripting", "alarms"],
    host_permissions: [`${import.meta.env.VITE_API_URL}/*`],
  }),
  vite: () => ({
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }),
});
