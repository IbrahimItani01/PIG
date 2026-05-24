import { configureStore } from "@reduxjs/toolkit";
import { uiSlice } from "@/lib/store/ui-slice";

export function makeStore() {
  return configureStore({
    reducer: {
      ui: uiSlice.reducer,
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
