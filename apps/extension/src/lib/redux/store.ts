import { configureStore } from "@reduxjs/toolkit";
import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";
import { backupApi } from "@/features/backup/data/backup.api";
import { dexieApi } from "@/lib/redux/dexie.api";

export const store = configureStore({
  reducer: {
    [dexieApi.reducerPath]: dexieApi.reducer,
    [backupApi.reducerPath]: backupApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(dexieApi.middleware, backupApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
