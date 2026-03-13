import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { SidebarTab } from "@/components/sidebar";
import { wxtStorage } from "@/features/shared/stores/wxt-storage";

type AppState = {
  activeTab: SidebarTab;
};

const initialApp: AppState = {
  activeTab: "configs",
};

type AppSlice = AppState & {
  setActiveTab: (tab: SidebarTab) => void;
};

export const useAppStore = create<AppSlice>()(
  persist(
    (set) => ({
      ...initialApp,
      setActiveTab: (tab) => set(() => ({ activeTab: tab })),
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => wxtStorage),
    },
  ),
);
