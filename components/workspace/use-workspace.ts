"use client";

import { useAppSelector } from "@/lib/store/hooks";

export function useWorkspaceSnapshot() {
  return useAppSelector((state) => state.workspace.snapshot);
}
