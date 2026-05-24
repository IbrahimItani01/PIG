"use client";

import { useState } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/lib/store/app-store";
import { GlobalLoader } from "@/components/ui/global-loader";
import { NavigationStateBridge } from "@/components/layout/navigation-state-bridge";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState<AppStore>(() => makeStore());

  return (
    <Provider store={store}>
      <NavigationStateBridge />
      {children}
      <GlobalLoader />
    </Provider>
  );
}
