import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
      <Link href="/login" className="text-sm text-muted-foreground">Already have an account?</Link>
    </main>
  );
}
