import { create } from "zustand";

type RecordState = {
  configId?: string;
  filterString?: string;
};

type RecordActions = {
  setConfigId: (configId?: string) => void;
  setFilterString: (filterString?: string) => void;
};

type RecordSlice = RecordState & {
  actions: RecordActions;
};

export const DEFAULT_STATE: RecordState = {
  configId: undefined,
  filterString: undefined,
};

export const useRecordStore = create<RecordSlice>()((set) => ({
  ...DEFAULT_STATE,
  actions: {
    setConfigId: (configId) => set(() => ({ configId })),
    setFilterString: (filterString) => set(() => ({ filterString })),
  },
}));
