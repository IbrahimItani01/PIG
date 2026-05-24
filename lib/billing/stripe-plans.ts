import type { Plan } from "@prisma/client";
import { plans } from "@/config/plans";
import { getOptionalEnv } from "@/lib/utils/env";

export const paidPlans = Object.values(plans).filter((plan) => plan.priceCents > 0);

export function getStripePriceIdForPlan(plan: Plan) {
  const envVar = plans[plan].stripePriceEnvVar;
  return envVar ? getOptionalEnv(envVar) : undefined;
}

export function getPlanByStripePriceId(priceId?: string | null): Plan | null {
  if (!priceId) return null;

  for (const plan of paidPlans) {
    if (plan.stripePriceEnvVar && getOptionalEnv(plan.stripePriceEnvVar) === priceId) {
      return plan.name;
    }
  }

  return null;
}

export function isPaidPlan(plan: Plan) {
  return plans[plan].priceCents > 0;
}
