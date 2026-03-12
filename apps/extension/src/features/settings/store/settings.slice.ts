import { createSlice } from "@reduxjs/toolkit";
import { loadSettings } from "@/features/settings/store/settings.thunk";
import type { SettingsInput } from "@/features/settings/types/settings";

export const DEFAULT_SETTINGS: SettingsInput = {
  debugMode: false,
  theme: "system",
  language: "english",
};

const settingsSlice = createSlice({
  name: "settings",
  initialState: DEFAULT_SETTINGS,
  reducers: {
    updateSettings(state, action: { payload: Partial<SettingsInput> }) {
      return { ...state, ...action.payload };
    },
    resetSettings() {
      return DEFAULT_SETTINGS;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadSettings.fulfilled, (_state, action) => {
      if (action.payload) return action.payload;
    });
  },
});

export const { updateSettings, resetSettings } = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;
