import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { wxtStorage } from "@/features/shared/stores/wxt-storage";

type SidebarSlice = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const useSidebarStore = create<SidebarSlice>()(
  persist(
    (set) => ({
      open: true,
      setOpen: (open) => set(() => ({ open })),
    }),
    {
      name: "sidebar-storage",
      storage: createJSONStorage(() => wxtStorage),
    },
  ),
);
