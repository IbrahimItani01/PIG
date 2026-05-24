"use client";

import { LogOut, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Plan } from "@prisma/client";
import type { LogicalModelId } from "@/config/models";
import type { ResolvedModel } from "@/lib/ai/model-registry";
import { Button } from "@/components/ui/button";
import { ButtonLoader } from "@/components/ui/button-loader";
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
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function saveAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (deleting) return;

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
    if (deleting) return;

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

  async function deleteAccount() {
    setDeleting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirmation: deleteConfirmation }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Account deletion failed.");
      }

      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      window.location.href = "/login?message=Your%20account%20has%20been%20deleted.";
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Account deletion failed.");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
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
          <Button type="submit" disabled={saving || deleting}>
            {saving ? <ButtonLoader /> : <Save className="h-4 w-4" />}
            {saving ? "Saving" : "Save account"}
          </Button>
          <Button type="button" variant="secondary" disabled={signingOut || deleting} onClick={signOut}>
            {signingOut ? <ButtonLoader /> : <LogOut className="h-4 w-4" />}
            {signingOut ? "Signing out" : "Sign out"}
          </Button>
        </div>
      </form>

      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-destructive">Delete account</h3>
          <p className="text-sm text-muted-foreground">
            This permanently deletes your PIG account data, evaluations, usage history, and profile. Any active Stripe subscription is canceled first.
          </p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label htmlFor="delete-confirmation">Type your email to confirm</Label>
            <Input
              id="delete-confirmation"
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
              placeholder={user.email}
              autoComplete="off"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            disabled={deleting || deleteConfirmation !== user.email}
            onClick={deleteAccount}
          >
            {deleting ? <ButtonLoader /> : <Trash2 className="h-4 w-4" />}
            {deleting ? "Deleting" : "Delete account"}
          </Button>
        </div>
      </div>
    </div>
  );
}
