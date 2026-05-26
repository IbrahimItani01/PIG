import { getAllowedModels } from "@/lib/ai/model-registry";
import type { AuthenticatedUser } from "@/lib/auth/session";
import { requireUser } from "@/lib/auth/session";
import { getBillingUsageSummary, type BillingUsageSummary } from "@/lib/billing/usage";
import { getPrisma } from "@/lib/db/prisma";
import { workspaceConfig } from "@/config/workspace";
import type { WorkspaceSnapshot, WorkspaceUsageSummary } from "@/lib/store/workspace-slice";
import { evaluationSummarySelect, serializeEvaluationSummary, serializeSubscription } from "@/lib/workspace/serializers";

function serializeUsage(usage: BillingUsageSummary): WorkspaceUsageSummary {
  return {
    plan: usage.plan,
    canOpenPortal: Boolean(usage.subscription?.stripeCustomerId),
    period: {
      start: usage.period.start.toISOString(),
      end: usage.period.end.toISOString(),
      source: usage.period.source,
    },
    evaluations: usage.evaluations,
    promptTests: usage.promptTests,
    qualityModelRuns: usage.qualityModelRuns,
    subscription: serializeSubscription(usage.subscription),
  };
}

function serializeUser(user: AuthenticatedUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    role: user.role,
    plan: user.plan,
    preferredModel: user.preferredModel,
    authProvider: user.authProvider,
    emailConfirmedAt: user.emailConfirmedAt,
    lastSignInAt: user.lastSignInAt,
  };
}

export async function getWorkspaceSnapshot(): Promise<WorkspaceSnapshot> {
  const user = await requireUser();
  const prisma = getPrisma();

  const [evaluations, aggregate, usage, adminUsageEvents] = await Promise.all([
    prisma.promptEvaluation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: evaluationSummarySelect,
      take: workspaceConfig.recentEvaluationsLimit,
    }),
    prisma.promptEvaluation.aggregate({
      where: { userId: user.id },
      _count: true,
      _avg: { overallScore: true },
      _max: { overallScore: true },
    }),
    getBillingUsageSummary(user.id, user.plan),
    prisma.usageEvent.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true },
      take: user.role === "ADMIN" ? 50 : 0,
    }),
  ]);

  const models = getAllowedModels(user.plan);
  const preferredIndex = models.findIndex((model) => model.id === user.preferredModel);
  const orderedModels =
    preferredIndex > 0 ? [models[preferredIndex], ...models.slice(0, preferredIndex), ...models.slice(preferredIndex + 1)] : models;

  return {
    user: serializeUser(user),
    recentEvaluations: evaluations.map(serializeEvaluationSummary),
    usage: serializeUsage(usage),
    dashboard: {
      totalEvaluations: aggregate._count,
      averageScore: aggregate._avg.overallScore ? aggregate._avg.overallScore.toFixed(1) : "0.0",
      bestScore: aggregate._max.overallScore ? aggregate._max.overallScore.toFixed(1) : "0.0",
      remainingCredits: usage.evaluations.remaining,
    },
    models: orderedModels,
    adminUsageEvents: adminUsageEvents.map((event) => ({
      id: event.id,
      userEmail: event.user.email,
      eventType: event.eventType,
      modelId: event.modelId,
      createdAt: event.createdAt.toISOString(),
    })),
    hydratedAt: new Date().toISOString(),
  };
}
