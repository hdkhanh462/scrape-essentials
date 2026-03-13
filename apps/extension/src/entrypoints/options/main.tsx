import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import "@/global.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import App from "@/entrypoints/options/App";
import { queryClient } from "@/features/shared/query-client";
import { store } from "@/lib/redux/store.ts";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <App />
          <Toaster richColors />
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
);
