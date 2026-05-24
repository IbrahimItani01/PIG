import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <Suspense>
        <AuthForm mode="forgot" />
      </Suspense>
      <Link href="/login" className="text-sm text-muted-foreground">Back to login</Link>
    </main>
  );
}
