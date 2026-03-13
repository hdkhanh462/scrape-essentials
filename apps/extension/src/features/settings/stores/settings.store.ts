import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { SettingsInput } from "@/features/settings/types/settings";
import { wxtStorage } from "@/lib/zustand/wxt-storage";

type SettingsSlice = SettingsInput & {
  updateSettings: (settings: Partial<SettingsInput>) => void;
  resetSettings: () => void;
};

export const DEFAULT_SETTINGS: SettingsInput = {
  debugMode: false,
  theme: "system",
  language: "english",
};

export const useSettingsStore = create<SettingsSlice>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
      resetSettings: () => set(() => DEFAULT_SETTINGS),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => wxtStorage),
    },
  ),
);
