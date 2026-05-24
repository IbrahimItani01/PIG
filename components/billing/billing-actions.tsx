"use client";

import { CreditCard, ExternalLink } from "lucide-react";
import { useState } from "react";
import type { Plan } from "@prisma/client";
import { Button } from "@/components/ui/button";

export function CheckoutButton({
  plan,
  children,
  variant = "default",
  disabled,
}: {
  plan: Extract<Plan, "PRO" | "PREMIUM">;
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline";
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={variant}
        className="w-full"
        disabled={disabled || loading}
        onClick={async () => {
          setLoading(true);
          setMessage(null);
          const response = await fetch("/api/stripe/checkout", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ plan }),
          });
          const payload = await response.json();
          setLoading(false);

          if (payload.url) {
            window.location.href = payload.url;
            return;
          }

          setMessage(payload.error ?? payload.message ?? "Checkout is unavailable.");
        }}
      >
        <CreditCard className="h-4 w-4" />
        {loading ? "Opening checkout" : children}
      </Button>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}

export function PortalButton({ disabled }: { disabled?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="secondary"
        disabled={disabled || loading}
        onClick={async () => {
          setLoading(true);
          setMessage(null);
          const response = await fetch("/api/stripe/portal", { method: "POST" });
          const payload = await response.json();
          setLoading(false);

          if (payload.url) {
            window.location.href = payload.url;
            return;
          }

          setMessage(payload.error ?? payload.message ?? "Billing portal is unavailable.");
        }}
      >
        <ExternalLink className="h-4 w-4" />
        {loading ? "Opening portal" : "Manage billing"}
      </Button>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}
