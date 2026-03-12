import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import "@/global.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import App from "@/entrypoints/popup/App";
import { loadSettings } from "@/features/settings/store/settings.thunk";
import { store } from "@/lib/redux/store.ts";

await store.dispatch(loadSettings());

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
);
