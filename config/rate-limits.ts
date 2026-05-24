import { plans } from "@/config/plans";

export const rateLimitConfig = {
  anonymous: { dailyEvaluations: 2, windowSeconds: 24 * 60 * 60 },
  byPlan: {
    FREE: { dailyEvaluations: plans.FREE.dailyEvaluations, windowSeconds: 24 * 60 * 60 },
    PRO: { dailyEvaluations: plans.PRO.dailyEvaluations, windowSeconds: 24 * 60 * 60 },
    PREMIUM: { dailyEvaluations: plans.PREMIUM.dailyEvaluations, windowSeconds: 24 * 60 * 60 },
  },
} as const;
