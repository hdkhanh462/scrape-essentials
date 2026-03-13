import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import "@/global.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import App from "@/entrypoints/popup/App";
import { store } from "@/lib/redux/store.ts";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
);
