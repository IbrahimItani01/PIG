"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Plan } from "@prisma/client";
import { plans } from "@/config/plans";
import { Button } from "@/components/ui/button";

export function PlanActivation({ plan }: { plan: Plan }) {
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function activate() {
      const response = await fetch("/api/stripe/plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? payload.message ?? "Plan activation failed.");
        return;
      }

      if (payload.url) {
        window.location.href = payload.url;
        return;
      }

      window.location.href = payload.redirectTo ?? "/dashboard";
    }

    activate().catch((activationError) => {
      setError(activationError instanceof Error ? activationError.message : "Plan activation failed.");
    });
  }, [plan]);

  return (
    <div className="space-y-4 text-center">
      {error ? (
        <>
          <CheckCircle2 className="mx-auto h-10 w-10 text-warning" />
          <div>
            <h1 className="text-2xl font-semibold">Plan needs attention</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          </div>
          <Button asChild>
            <a href="/billing">Open billing</a>
          </Button>
        </>
      ) : (
        <>
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <div>
            <h1 className="text-2xl font-semibold">Activating {plans[plan].label}...</h1>
            <p className="mt-2 text-sm text-muted-foreground">Your account is ready. We are setting up Stripe tracking for your selected plan.</p>
          </div>
        </>
      )}
    </div>
  );
}
