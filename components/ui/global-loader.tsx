"use client";

import { Loader2 } from "lucide-react";
import { useAppSelector } from "@/lib/store/hooks";

export function GlobalLoader() {
  const { appLoading, loadingLabel } = useAppSelector((state) => state.ui);

  if (!appLoading) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-md border bg-card px-4 py-3 text-sm shadow-lg">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span>{loadingLabel}</span>
      </div>
    </div>
  );
}
