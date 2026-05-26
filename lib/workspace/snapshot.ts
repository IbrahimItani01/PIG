import { type PromptEvaluation, type PromptVersion, type Subscription } from "@prisma/client";
import { getAllowedModels } from "@/lib/ai/model-registry";
import type { AuthenticatedUser } from "@/lib/auth/session";
import { requireUser } from "@/lib/auth/session";
import { getBillingUsageSummary, type BillingUsageSummary } from "@/lib/billing/usage";
import { getPrisma } from "@/lib/db/prisma";
import type { WorkspaceEvaluation, WorkspaceSnapshot, WorkspaceSubscription, WorkspaceUsageSummary } from "@/lib/store/workspace-slice";

type EvaluationWithVersions = PromptEvaluation & {
  versions: PromptVersion[];
};

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function serializeSubscription(subscription: Subscription | null): WorkspaceSubscription | null {
  if (!subscription) return null;

  return {
    id: subscription.id,
    userId: subscription.userId,
    plan: subscription.plan,
    stripeCustomerId: subscription.stripeCustomerId,
    stripeSubscriptionId: subscription.stripeSubscriptionId,
    status: subscription.status,
    priceId: subscription.priceId,
    currentPeriodStart: subscription.currentPeriodStart?.toISOString() ?? null,
    currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    cancelAt: subscription.cancelAt?.toISOString() ?? null,
    canceledAt: subscription.canceledAt?.toISOString() ?? null,
    createdAt: subscription.createdAt.toISOString(),
    updatedAt: subscription.updatedAt.toISOString(),
  };
}

function serializeUsage(usage: BillingUsageSummary): WorkspaceUsageSummary {
  return {
    plan: usage.plan,
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

function serializeEvaluation(evaluation: EvaluationWithVersions): WorkspaceEvaluation {
  return {
    id: evaluation.id,
    userId: evaluation.userId,
    title: evaluation.title,
    originalPrompt: evaluation.originalPrompt,
    useCase: evaluation.useCase,
    targetAudience: evaluation.targetAudience,
    desiredOutput: evaluation.desiredOutput,
    tone: evaluation.tone,
    modelProvider: evaluation.modelProvider,
    modelId: evaluation.modelId,
    overallScore: evaluation.overallScore,
    clarityScore: evaluation.clarityScore,
    contextScore: evaluation.contextScore,
    specificityScore: evaluation.specificityScore,
    constraintsScore: evaluation.constraintsScore,
    outputFormatScore: evaluation.outputFormatScore,
    examplesScore: evaluation.examplesScore,
    safetyScore: evaluation.safetyScore,
    testabilityScore: evaluation.testabilityScore,
    summary: evaluation.summary,
    weaknesses: stringArray(evaluation.weaknesses),
    recommendations: stringArray(evaluation.recommendations),
    improvedPrompt: evaluation.improvedPrompt,
    createdAt: evaluation.createdAt.toISOString(),
    updatedAt: evaluation.updatedAt.toISOString(),
    versions: evaluation.versions.map((version) => ({
      id: version.id,
      evaluationId: version.evaluationId,
      label: version.label,
      promptText: version.promptText,
      versionType: version.versionType,
      notes: version.notes,
      createdAt: version.createdAt.toISOString(),
    })),
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
      include: { versions: { orderBy: { createdAt: "asc" } } },
      take: 100,
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
    evaluations: evaluations.map(serializeEvaluation),
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
