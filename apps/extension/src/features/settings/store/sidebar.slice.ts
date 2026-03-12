import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SidebarTab } from "@/components/sidebar";

export interface SidebarState {
  activeTab: SidebarTab;
}

const initialState: SidebarState = {
  activeTab: "configs",
};

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<SidebarTab>) => {
      state.activeTab = action.payload;
    },
  },
});

export const { setActiveTab } = sidebarSlice.actions;
export const sidebarReducer = sidebarSlice.reducer;
