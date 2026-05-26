"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/lib/store/app-store";
import { useAppDispatch } from "@/lib/store/hooks";
import { hydrateWorkspace, type WorkspaceSnapshot } from "@/lib/store/workspace-slice";
import { GlobalLoader } from "@/components/ui/global-loader";
import { NavigationStateBridge } from "@/components/layout/navigation-state-bridge";

export function ReduxProvider({
  children,
  initialWorkspaceSnapshot,
}: {
  children: React.ReactNode;
  initialWorkspaceSnapshot?: WorkspaceSnapshot;
}) {
  const [store] = useState<AppStore>(() =>
    makeStore(initialWorkspaceSnapshot ? { workspace: { snapshot: initialWorkspaceSnapshot } } : undefined),
  );

  return (
    <Provider store={store}>
      <WorkspaceHydrator snapshot={initialWorkspaceSnapshot} />
      <NavigationStateBridge />
      {children}
      <GlobalLoader />
    </Provider>
  );
}

function WorkspaceHydrator({ snapshot }: { snapshot?: WorkspaceSnapshot }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (snapshot) dispatch(hydrateWorkspace(snapshot));
  }, [dispatch, snapshot]);

  return null;
}
