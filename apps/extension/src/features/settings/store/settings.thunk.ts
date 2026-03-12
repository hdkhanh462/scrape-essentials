import { createAsyncThunk } from "@reduxjs/toolkit";
import { LOCAL_STORAGE_KEYS } from "@/features/scrape-configs/consts/local-storage";
import type { SettingsInput } from "@/features/settings/types/settings";

export const loadSettings = createAsyncThunk<SettingsInput | null>(
  "settings/load",
  async () => {
    return await storage.getItem<SettingsInput>(
      `local:${LOCAL_STORAGE_KEYS.SETTINGS}`,
    );
  },
);
