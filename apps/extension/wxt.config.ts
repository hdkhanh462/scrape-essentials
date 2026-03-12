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
    permissions: ["activeTab", "identity", "storage", "scripting"],
    host_permissions: ["https://*/*"],
    oauth2: {
      client_id: import.meta.env.WXT_APP_CLIENT_ID,
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    },
  }),
  webExt: {
    binaries: {
      brave:
        "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }),
});
