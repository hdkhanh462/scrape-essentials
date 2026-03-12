import { configureStore } from "@reduxjs/toolkit";
import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";
import { scrapingApi } from "@/features/scraped-records/data/scraping.api";
import { recordReducer } from "@/features/scraped-records/store/record.slice";
import { persistSettingsMiddleware } from "@/features/settings/store/settings.middleware";
import { settingsReducer } from "@/features/settings/store/settings.slice";
import { sidebarReducer } from "@/features/settings/store/sidebar.slice";
import { dexieApi } from "@/lib/redux/dexie.api";

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    sidebar: sidebarReducer,
    record: recordReducer,

    [scrapingApi.reducerPath]: scrapingApi.reducer,
    [dexieApi.reducerPath]: dexieApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(
      scrapingApi.middleware,
      dexieApi.middleware,
      persistSettingsMiddleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
