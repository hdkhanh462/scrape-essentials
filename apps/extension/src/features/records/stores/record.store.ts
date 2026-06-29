import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { wxtStorage } from "@/features/shared/stores/wxt-storage";

type RecordState = {
  configId?: string;
  filterString?: string;
  filterHistory: string[];
};

type RecordActions = {
  setConfigId: (configId?: string) => void;
  setFilterString: (filterString?: string) => void;
  setFilterHistory: (filterHistory: string[]) => void;
  saveFilterHistory: (keyword: string) => void;
  removeFilterHistory: (keyword: string) => void;
};

type RecordSlice = RecordState & {
  actions: RecordActions;
};

export const DEFAULT_STATE: RecordState = {
  configId: undefined,
  filterString: undefined,
  filterHistory: [],
};

export const useRecordStore = create<RecordSlice>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,
      actions: {
        setConfigId: (configId) => set(() => ({ configId })),
        setFilterString: (filterString) => set(() => ({ filterString })),
        setFilterHistory: (filterHistory) => set(() => ({ filterHistory })),
        saveFilterHistory: (keyword) =>
          set((state) => {
            if (!keyword.trim()) return state;

            const next = [
              keyword,
              ...state.filterHistory.filter((x) => x !== keyword),
            ].slice(0, 20);

            return { filterHistory: next };
          }),
        removeFilterHistory: (keyword) =>
          set((state) => {
            const next = state.filterHistory.filter((x) => x !== keyword);
            return { filterHistory: next };
          }),
      },
    }),
    {
      name: "record-storage",
      storage: createJSONStorage(() => wxtStorage),
      partialize: (state) => ({
        filterHistory: state.filterHistory,
      }),
    },
  ),
);
