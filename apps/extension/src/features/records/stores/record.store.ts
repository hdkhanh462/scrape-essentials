import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { wxtStorage } from "@/features/shared/stores/wxt-storage";

type RecordState = {
  configId?: string;
  filterString?: string;
};

type RecordSlice = RecordState & {
  setConfigId: (configId?: string) => void;
  setFilterString: (filterString?: string) => void;
};

export const DEFAULT_RECORD: RecordState = {
  configId: undefined,
  filterString: undefined,
};

export const useRecordStore = create<RecordSlice>()(
  persist(
    (set) => ({
      ...DEFAULT_RECORD,
      setConfigId: (configId) => set(() => ({ configId })),
      setFilterString: (filterString) => set(() => ({ filterString })),
    }),
    {
      name: "record-storage",
      storage: createJSONStorage(() => wxtStorage),
    },
  ),
);
