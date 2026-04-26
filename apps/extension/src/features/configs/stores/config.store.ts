import { create } from "zustand";

type ConfigState = {
  configId: string | null;
  mode: "add" | "edit";
  showDetail: boolean;
};

type ConfigActions = {
  setMode: (mode: "add" | "edit") => void;
  setConfigId: (configId: string | null) => void;
  showDetail: () => void;
  hideDetail: () => void;
  reset: () => void;
};

type ConfigSlice = ConfigState & {
  actions: ConfigActions;
};

export const DEFAULT_STATE: ConfigState = {
  mode: "add",
  configId: null,
  showDetail: false,
};

export const useConfigStore = create<ConfigSlice>()((set) => ({
  ...DEFAULT_STATE,
  actions: {
    setMode: (mode) => set(() => ({ mode })),
    setConfigId: (configId) => set(() => ({ configId })),
    showDetail: () => set(() => ({ showDetail: true })),
    hideDetail: () => set(() => ({ showDetail: false })),
    reset: () => set(() => DEFAULT_STATE),
  },
}));
