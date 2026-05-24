"use client";

import { LogOut, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Plan } from "@prisma/client";
import type { LogicalModelId } from "@/config/models";
import type { ResolvedModel } from "@/lib/ai/model-registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createSupabaseBrowserClient } from "@/lib/auth/supabase-client";

export function AccountSettingsForm({
  user,
  models,
}: {
  user: {
    email: string;
    name: string | null;
    plan: Plan;
    preferredModel: string;
  };
  models: ResolvedModel[];
}) {
  const router = useRouter();
  const [name, setName] = useState(user.name ?? "");
  const [preferredModel, setPreferredModel] = useState<LogicalModelId>((user.preferredModel as LogicalModelId) || (models[0]?.id ?? "default-fast"));
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function saveAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, preferredModel }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Account update failed.");
      }

      setMessage("Account settings saved.");
      router.refresh();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Account update failed.");
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    setSigningOut(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      setError(signOutError.message);
      setSigningOut(false);
      return;
    }

    router.push("/login?message=You%20have%20been%20signed%20out.");
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={saveAccount}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="account-email">Email</Label>
          <Input id="account-email" value={user.email} disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="account-name">Display name</Label>
          <Input id="account-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" maxLength={80} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="preferred-model">Default model</Label>
          <Select id="preferred-model" value={preferredModel} onChange={(event) => setPreferredModel(event.target.value as LogicalModelId)}>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.displayName} - {model.provider}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-success">{message}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "Saving" : "Save account"}
        </Button>
        <Button type="button" variant="secondary" disabled={signingOut} onClick={signOut}>
          <LogOut className="h-4 w-4" />
          {signingOut ? "Signing out" : "Sign out"}
        </Button>
      </div>
    </form>
  );
}
