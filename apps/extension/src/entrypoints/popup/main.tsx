import React from "react";
import ReactDOM from "react-dom/client";

import "@/global.css";
import "@/i18n/config.en";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/providers/theme-provider";
import App from "@/entrypoints/popup/App";
import { queryClient } from "@/features/shared/query-client";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
