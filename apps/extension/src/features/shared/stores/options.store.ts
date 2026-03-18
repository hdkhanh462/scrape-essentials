import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { SidebarTab } from "@/components/sidebar";
import { wxtStorage } from "@/features/shared/stores/wxt-storage";
import { VisibilityState } from "@tanstack/react-table";

type OptionsState = {
  activeTab: SidebarTab;
  columnVisibility: VisibilityState;
};

const initialOptions: OptionsState = {
  activeTab: "configs",
  columnVisibility: {},
};

type OptionsSlice = OptionsState & {
  setActiveTab: (tab: SidebarTab) => void;
  setColumnVisibility: (columnVisibility: VisibilityState) => void;
};

export const useOptionsStore = create<OptionsSlice>()(
  persist(
    (set) => ({
      ...initialOptions,
      setActiveTab: (tab) => set(() => ({ activeTab: tab })),
      setColumnVisibility: (columnVisibility) =>
        set(() => ({ columnVisibility })),
    }),
    {
      name: "options-storage",
      storage: createJSONStorage(() => wxtStorage),
    },
  ),
);
