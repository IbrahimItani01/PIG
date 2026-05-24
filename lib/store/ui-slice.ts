import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type RealtimeEvent = {
  table: string;
  eventType: string;
  at: string;
};

type UiState = {
  appLoading: boolean;
  loadingLabel: string;
  pendingRoute: string | null;
  lastRealtimeEvent: RealtimeEvent | null;
};

const initialState: UiState = {
  appLoading: false,
  loadingLabel: "Loading workspace",
  pendingRoute: null,
  lastRealtimeEvent: null,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    startAppLoading(state, action: PayloadAction<{ label?: string; route?: string } | undefined>) {
      state.appLoading = true;
      state.loadingLabel = action.payload?.label ?? "Loading workspace";
      state.pendingRoute = action.payload?.route ?? null;
    },
    stopAppLoading(state) {
      state.appLoading = false;
      state.pendingRoute = null;
    },
    recordRealtimeEvent(state, action: PayloadAction<{ table: string; eventType: string }>) {
      state.lastRealtimeEvent = {
        ...action.payload,
        at: new Date().toISOString(),
      };
    },
  },
});

export const { recordRealtimeEvent, startAppLoading, stopAppLoading } = uiSlice.actions;
