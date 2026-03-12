import type { RootState } from "@/lib/redux/store";

export const selectConfigId = (state: RootState) => state.record.configId;

export const selectFilterString = (state: RootState) =>
  state.record.filterString;
