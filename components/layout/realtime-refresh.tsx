"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/auth/supabase-client";
import { useAppDispatch } from "@/lib/store/hooks";
import { recordRealtimeEvent, startAppLoading, stopAppLoading } from "@/lib/store/ui-slice";

const realtimeTables = ["users", "prompt_evaluations", "usage_events", "subscriptions"] as const;

export function RealtimeRefresh({ userId }: { userId: string }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const channel = supabase.channel(`dashboard-realtime-${userId}`);

    for (const table of realtimeTables) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter: table === "users" ? `id=eq.${userId}` : `userId=eq.${userId}` },
        (payload) => {
          dispatch(recordRealtimeEvent({ table, eventType: payload.eventType }));

          if (refreshTimer.current) clearTimeout(refreshTimer.current);
          if (stopTimer.current) clearTimeout(stopTimer.current);

          dispatch(startAppLoading({ label: "Syncing latest changes" }));
          refreshTimer.current = setTimeout(() => {
            router.refresh();
            stopTimer.current = setTimeout(() => dispatch(stopAppLoading()), 900);
          }, 350);
        },
      );
    }

    channel.subscribe();

    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      if (stopTimer.current) clearTimeout(stopTimer.current);
      supabase.removeChannel(channel);
    };
  }, [dispatch, router, userId]);

  return null;
}
