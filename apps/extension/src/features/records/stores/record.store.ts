import { create } from "zustand";

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

export const useRecordStore = create<RecordSlice>()((set) => ({
  ...DEFAULT_RECORD,
  setConfigId: (configId) => set(() => ({ configId })),
  setFilterString: (filterString) => set(() => ({ filterString })),
}));
