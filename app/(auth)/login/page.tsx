import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
      <div className="flex gap-4 text-sm text-muted-foreground">
        <Link href="/signup">Create account</Link>
        <Link href="/forgot-password">Forgot password</Link>
      </div>
    </main>
  );
}
