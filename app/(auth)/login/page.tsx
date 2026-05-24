import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser } from "@/lib/auth/session";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
      <div className="flex gap-4 text-sm text-muted-foreground">
        <Link href="/signup">Create account</Link>
      </div>
    </main>
  );
}
