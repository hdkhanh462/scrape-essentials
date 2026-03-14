import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { SidebarTab } from "@/components/sidebar";
import { wxtStorage } from "@/features/shared/stores/wxt-storage";

type OptionsState = {
  activeTab: SidebarTab;
};

const initialOptions: OptionsState = {
  activeTab: "configs",
};

type OptionsSlice = OptionsState & {
  setActiveTab: (tab: SidebarTab) => void;
};

export const useOptionsStore = create<OptionsSlice>()(
  persist(
    (set) => ({
      ...initialOptions,
      setActiveTab: (tab) => set(() => ({ activeTab: tab })),
    }),
    {
      name: "options-storage",
      storage: createJSONStorage(() => wxtStorage),
    },
  ),
);
