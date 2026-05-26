import { configureStore } from "@reduxjs/toolkit";
import { uiSlice } from "@/lib/store/ui-slice";
import { workspaceSlice, type WorkspaceState } from "@/lib/store/workspace-slice";

export type PreloadedRootState = {
  workspace: WorkspaceState;
};

export function makeStore(preloadedState?: PreloadedRootState) {
  return configureStore({
    reducer: {
      ui: uiSlice.reducer,
      workspace: workspaceSlice.reducer,
    },
    preloadedState,
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
