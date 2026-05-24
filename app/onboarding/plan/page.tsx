import { redirect } from "next/navigation";
import type { Plan } from "@prisma/client";
import { PlanActivation } from "@/components/billing/plan-activation";
import { plans } from "@/config/plans";
import { requireUser } from "@/lib/auth/session";

export default async function OnboardingPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  await requireUser();
  const params = await searchParams;
  const plan = getSafePlan(params.plan);

  if (!plans[plan]) redirect("/signup");

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-md border bg-card p-8">
        <PlanActivation plan={plan} />
      </div>
    </main>
  );
}

function getSafePlan(value?: string): Plan {
  return value === "PRO" || value === "PREMIUM" ? value : "FREE";
}
