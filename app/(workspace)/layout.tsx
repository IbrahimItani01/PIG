import { AppShell } from "@/components/layout/app-shell";
import { ReduxProvider } from "@/components/providers/redux-provider";
import { getWorkspaceSnapshot } from "@/lib/workspace/snapshot";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const snapshot = await getWorkspaceSnapshot();

  return (
    <ReduxProvider initialWorkspaceSnapshot={snapshot}>
      <AppShell role={snapshot.user.role} user={snapshot.user}>
        {children}
      </AppShell>
    </ReduxProvider>
  );
}
