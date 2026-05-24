"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch } from "@/lib/store/hooks";
import { stopAppLoading } from "@/lib/store/ui-slice";

export function NavigationStateBridge() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  useEffect(() => {
    dispatch(stopAppLoading());
  }, [dispatch, pathname]);

  return null;
}
