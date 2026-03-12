import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface RecordState {
  configId?: string;
  filterString?: string;
}

const initialState: RecordState = {
  configId: undefined,
  filterString: undefined,
};

const recordSlice = createSlice({
  name: "record",
  initialState,
  reducers: {
    setConfigId: (state, action: PayloadAction<string | undefined>) => {
      state.configId = action.payload;
    },
    setFilterString: (state, action: PayloadAction<string | undefined>) => {
      state.filterString = action.payload;
    },
  },
});

export const { setConfigId, setFilterString } = recordSlice.actions;
export const recordReducer = recordSlice.reducer;
