import { UsageEventType, type Plan, type Subscription } from "@prisma/client";
import { plans } from "@/config/plans";
import { modelConfigs, type LogicalModelId } from "@/config/models";
import { getPrisma } from "@/lib/db/prisma";
import { isQualityModel } from "@/lib/ai/model-registry";

export type BillingPeriod = {
  start: Date;
  end: Date;
  source: "subscription" | "calendar";
};

export type UsageMetric = {
  used: number;
  limit: number;
  remaining: number;
  percent: number;
};

export type BillingUsageSummary = {
  plan: Plan;
  period: BillingPeriod;
  evaluations: UsageMetric;
  promptTests: UsageMetric;
  qualityModelRuns: UsageMetric;
  subscription: Subscription | null;
};

type UsageFeature = "evaluation" | "promptTest" | "qualityModelRun";

const qualityModelIds = Object.values(modelConfigs)
  .filter((model) => isQualityModel(model.id))
  .map((model) => model.id);

function buildMetric(used: number, limit: number): UsageMetric {
  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    percent: limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 100,
  };
}

export function getCalendarMonthPeriod(now = new Date()): BillingPeriod {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end, source: "calendar" };
}

export function getUsagePeriod(subscription?: Subscription | null, now = new Date()): BillingPeriod {
  if (subscription?.currentPeriodStart && subscription.currentPeriodEnd && subscription.currentPeriodEnd > now) {
    return {
      start: subscription.currentPeriodStart,
      end: subscription.currentPeriodEnd,
      source: "subscription",
    };
  }

  return getCalendarMonthPeriod(now);
}

export async function getBillingUsageSummary(userId: string, plan: Plan): Promise<BillingUsageSummary> {
  const prisma = getPrisma();
  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  const period = getUsagePeriod(subscription);
  const planConfig = plans[plan];

  const [evaluationsUsed, promptTestsUsed, qualityEvaluationsUsed, qualityPromptTestsUsed] = await Promise.all([
    prisma.promptEvaluation.count({
      where: { userId, createdAt: { gte: period.start, lt: period.end } },
    }),
    prisma.promptTestRun.count({
      where: { evaluation: { userId }, createdAt: { gte: period.start, lt: period.end } },
    }),
    prisma.promptEvaluation.count({
      where: { userId, modelId: { in: qualityModelIds }, createdAt: { gte: period.start, lt: period.end } },
    }),
    prisma.promptTestRun.count({
      where: { evaluation: { userId }, modelId: { in: qualityModelIds }, createdAt: { gte: period.start, lt: period.end } },
    }),
  ]);

  return {
    plan,
    period,
    evaluations: buildMetric(evaluationsUsed, planConfig.monthlyEvaluations),
    promptTests: buildMetric(promptTestsUsed, planConfig.monthlyPromptTests),
    qualityModelRuns: buildMetric(qualityEvaluationsUsed + qualityPromptTestsUsed, planConfig.monthlyQualityModelRuns),
    subscription,
  };
}

export async function checkMonthlyUsageLimit({
  userId,
  plan,
  feature,
  modelId,
}: {
  userId: string;
  plan: Plan;
  feature: UsageFeature;
  modelId?: LogicalModelId | string;
}) {
  const usage = await getBillingUsageSummary(userId, plan);

  if (feature === "evaluation" && usage.evaluations.remaining <= 0) {
    return { success: false, usage, message: "You have reached your monthly evaluation limit. Your quota resets next month." };
  }

  if (feature === "promptTest" && usage.promptTests.remaining <= 0) {
    return { success: false, usage, message: "You have reached your monthly prompt test limit. Your quota resets next month." };
  }

  if (modelId && isQualityModel(modelId) && usage.qualityModelRuns.remaining <= 0) {
    return { success: false, usage, message: "You have reached your monthly quality model limit. Use a fast model or wait for the next billing period." };
  }

  return { success: true, usage, message: null };
}

export async function recordLimitEvent({
  userId,
  eventType,
  modelId,
  reason,
}: {
  userId: string;
  eventType: UsageEventType;
  modelId?: string;
  reason: string;
}) {
  await getPrisma().usageEvent.create({
    data: {
      userId,
      eventType,
      modelProvider: "monthly-limit",
      modelId,
      metadata: { blocked: true, reason },
    },
  });
}
