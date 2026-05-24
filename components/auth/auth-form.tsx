"use client";

import { KeyRound, Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Plan } from "@prisma/client";
import { brand } from "@/config/brand";
import { plans } from "@/config/plans";
import { Button } from "@/components/ui/button";
import { ButtonLoader } from "@/components/ui/button-loader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/auth/supabase-client";

type AuthMode = "login" | "signup";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<Plan>(getSafePlan(searchParams.get("plan")));
  const [message, setMessage] = useState<string | null>(searchParams.get("message"));
  const [error, setError] = useState<string | null>(searchParams.get("error"));
  const [loading, setLoading] = useState(false);
  const isSignup = mode === "signup";
  const next = isSignup ? `/onboarding/plan?plan=${selectedPlan}` : getSafeNext(searchParams.get("next"));
  const emailRedirectTo = typeof window === "undefined"
    ? undefined
    : `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const supabase = createSupabaseBrowserClient();

    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo,
          shouldCreateUser: true,
          data: isSignup && name.trim().length > 0 ? { name: name.trim() } : undefined,
        },
      });
      if (authError) throw authError;
      setMessage(isSignup ? "Check your email to finish creating your account." : "Check your email for a secure sign-in link.");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);
    setMessage(null);
    const supabase = createSupabaseBrowserClient();

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: emailRedirectTo,
        },
      });
      if (authError) throw authError;
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Google sign-in failed.");
      setLoading(false);
    }
  }

  const titles = {
    login: `Sign in to ${brand.fullName}`,
    signup: `Create your ${brand.fullName} account`,
  };
  const descriptions = {
    login: "Use Google or a secure email link. Password sign-in is no longer supported.",
    signup: "Create your account with Google or a secure email link. No password required.",
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{titles[mode]}</CardTitle>
        <CardDescription>{descriptions[mode]}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSignup ? (
          <div className="space-y-3">
            <Label>Choose your plan</Label>
            <div className="grid gap-2">
              {Object.values(plans).map((plan) => (
                <button
                  key={plan.name}
                  type="button"
                  className={`rounded-md border p-3 text-left transition ${selectedPlan === plan.name ? "border-primary bg-primary/10" : "hover:bg-secondary"}`}
                  onClick={() => setSelectedPlan(plan.name)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{plan.label}</span>
                    <span className="text-sm text-muted-foreground">{plan.price}/mo</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <Button type="button" variant="secondary" className="w-full" disabled={loading} onClick={signInWithGoogle}>
          {loading ? <ButtonLoader /> : <KeyRound className="h-4 w-4" />}
          {loading ? "Connecting" : "Continue with Google"}
        </Button>

        <form className="space-y-4" onSubmit={onSubmit}>
          {mode === "signup" ? (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {message ? <p className="text-sm text-success">{message}</p> : null}
          <Button className="w-full" disabled={loading}>
            {loading ? <ButtonLoader /> : <Mail className="h-4 w-4" />}
            {loading ? "Please wait" : "Email me a secure link"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function getSafeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

function getSafePlan(value: string | null): Plan {
  return value === "PRO" || value === "PREMIUM" ? value : "FREE";
}
