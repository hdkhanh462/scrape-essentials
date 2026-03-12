import { isAnyOf, type Middleware } from "@reduxjs/toolkit";
import {
  resetSettings,
  updateSettings,
} from "@/features/settings/store/settings.slice";
import type { RootState } from "@/lib/redux/store";

export const persistSettingsMiddleware: Middleware =
  (store) => (next) => async (action) => {
    const result = next(action);

    if (isAnyOf(updateSettings, resetSettings)(action)) {
      const settings = (store.getState() as RootState).settings;
      await storage.setItem("local:settings", settings);
    }

    return result;
  };
