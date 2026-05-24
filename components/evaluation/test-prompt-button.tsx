"use client";

import { FlaskConical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonLoader } from "@/components/ui/button-loader";

export function TestPromptButton({ evaluationId, model }: { evaluationId: string; model: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="secondary"
        onClick={async () => {
          setLoading(true);
          setMessage(null);
          const response = await fetch(`/api/evaluations/${evaluationId}/test`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ model }),
          });
          const payload = await response.json();
          setLoading(false);
          setMessage(response.ok ? "Test run saved." : payload.error ?? "Test run failed.");
          if (response.ok) router.refresh();
        }}
        disabled={loading}
      >
        {loading ? <ButtonLoader /> : <FlaskConical className="h-4 w-4" />}
        {loading ? "Testing" : "Test prompt"}
      </Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
