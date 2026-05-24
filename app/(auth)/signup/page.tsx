import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser } from "@/lib/auth/session";

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
      <Link href="/login" className="text-sm text-muted-foreground">Already have an account?</Link>
    </main>
  );
}
