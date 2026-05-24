"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { brand } from "@/config/brand";
import { adminNavigation, appNavigation } from "@/config/navigation";
import { UserAvatar } from "@/components/account/user-avatar";
import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@prisma/client";
import { RealtimeRefresh } from "@/components/layout/realtime-refresh";
import { useAppDispatch } from "@/lib/store/hooks";
import { startAppLoading } from "@/lib/store/ui-slice";

export function AppShell({
  children,
  role,
  user,
}: {
  children: React.ReactNode;
  role: UserRole;
  user?: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
}) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const navigation = role === "ADMIN" ? [...appNavigation, ...adminNavigation] : appNavigation;

  function startNavigation(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || href === pathname) return;
    dispatch(startAppLoading({ label: "Loading workspace", route: href }));
  }

  return (
    <div className="min-h-screen bg-background">
      {user ? <RealtimeRefresh userId={user.id} /> : null}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-card/80 p-5 backdrop-blur lg:block">
        <Link href="/dashboard" className="flex items-center gap-3" onClick={(event) => startNavigation(event, "/dashboard")}>
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary font-bold">{brand.shortName[0]}</div>
          <div>
            <div className="font-semibold">{brand.shortName}</div>
            <div className="text-xs text-muted-foreground">Prompt grading</div>
          </div>
        </Link>
        <nav className="mt-8 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              onClick={(event) => startNavigation(event, item.href)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <Badge className="mt-8" variant="secondary">
          {role.toLowerCase()} workspace
        </Badge>
        {user ? (
          <Link
            href="/settings"
            className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-md border bg-background/70 p-3 text-sm transition hover:bg-secondary"
            onClick={(event) => startNavigation(event, "/settings")}
          >
            <UserAvatar name={user.name} email={user.email} imageUrl={user.avatarUrl} size="md" />
            <div className="min-w-0">
              <div className="truncate font-medium">{user.name ?? "Account"}</div>
              <div className="truncate text-xs text-muted-foreground">{user.email}</div>
            </div>
          </Link>
        ) : null}
      </aside>
      <main className="min-h-screen lg:pl-64">
        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
