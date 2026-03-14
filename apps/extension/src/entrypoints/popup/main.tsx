import React from "react";
import ReactDOM from "react-dom/client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import App from "@/entrypoints/popup/App";
import { queryClient } from "@/features/shared/query-client";
import "@/global.css";
import { QueryClientProvider } from "@tanstack/react-query";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
