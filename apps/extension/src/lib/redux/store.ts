import { configureStore } from "@reduxjs/toolkit";
import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";
import { backupApi } from "@/features/backup/data/backup.api";
import { scrapingApi } from "@/features/scraped-records/data/scraping.api";
import { recordReducer } from "@/features/scraped-records/store/record.slice";
import { dexieApi } from "@/lib/redux/dexie.api";

export const store = configureStore({
  reducer: {
    record: recordReducer,

    [scrapingApi.reducerPath]: scrapingApi.reducer,
    [dexieApi.reducerPath]: dexieApi.reducer,
    [backupApi.reducerPath]: backupApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(
      scrapingApi.middleware,
      dexieApi.middleware,
      backupApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
