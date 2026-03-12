import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import "@/global.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import App from "@/entrypoints/options/App";
import { loadSettings } from "@/features/settings/store/settings.thunk";
import { store } from "@/lib/redux/store.ts";

await store.dispatch(loadSettings());

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <App />
        <Toaster richColors />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
);
