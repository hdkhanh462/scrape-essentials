import type { RootState } from "@/lib/redux/store";

export const selectActiveTab = (state: RootState) => state.sidebar.activeTab;
