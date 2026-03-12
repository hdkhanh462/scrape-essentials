import type { RootState } from "@/lib/redux/store";

export const selectDebugMode = (state: RootState) => state.settings.debugMode;
export const selectTheme = (state: RootState) => state.settings.theme;
export const selectLanguage = (state: RootState) => state.settings.language;
