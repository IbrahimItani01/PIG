"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/auth/supabase-client";

type AuthMode = "login" | "signup" | "forgot";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const supabase = createSupabaseBrowserClient();
    const next = searchParams.get("next") ?? "/dashboard";

    try {
      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        router.push(next);
        router.refresh();
      }

      if (mode === "signup") {
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (authError) throw authError;
        setMessage("Check your email to confirm your account, then sign in.");
      }

      if (mode === "forgot") {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (authError) throw authError;
        setMessage("Password reset instructions sent.");
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  const titles = {
    login: `Log in to ${brand.fullName}`,
    signup: `Create your ${brand.fullName} account`,
    forgot: `Reset your ${brand.fullName} password`,
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{titles[mode]}</CardTitle>
        <CardDescription>{brand.tagline}</CardDescription>
      </CardHeader>
      <CardContent>
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
          {mode !== "forgot" ? (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} />
            </div>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {message ? <p className="text-sm text-success">{message}</p> : null}
          <Button className="w-full" disabled={loading}>
            {loading ? "Please wait" : mode === "login" ? "Log in" : mode === "signup" ? "Sign up" : "Send reset email"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
