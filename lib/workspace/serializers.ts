import type { PromptEvaluation, PromptVersion, Subscription } from "@prisma/client";
import type {
  WorkspaceEvaluationDetail,
  WorkspaceEvaluationSummary,
  WorkspaceSubscription,
} from "@/lib/store/workspace-slice";

export type EvaluationWithVersions = PromptEvaluation & {
  versions: PromptVersion[];
};

export type EvaluationSummaryRecord = Pick<
  PromptEvaluation,
  "id" | "title" | "useCase" | "modelProvider" | "modelId" | "overallScore" | "createdAt" | "updatedAt"
>;

export const evaluationSummarySelect = {
  id: true,
  title: true,
  useCase: true,
  modelProvider: true,
  modelId: true,
  overallScore: true,
  createdAt: true,
  updatedAt: true,
} as const;

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function serializeSubscription(subscription: Subscription | null): WorkspaceSubscription | null {
  if (!subscription) return null;

  return {
    id: subscription.id,
    userId: subscription.userId,
    plan: subscription.plan,
    status: subscription.status,
    currentPeriodStart: subscription.currentPeriodStart?.toISOString() ?? null,
    currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    cancelAt: subscription.cancelAt?.toISOString() ?? null,
    canceledAt: subscription.canceledAt?.toISOString() ?? null,
    createdAt: subscription.createdAt.toISOString(),
    updatedAt: subscription.updatedAt.toISOString(),
  };
}

export function serializeEvaluationSummary(evaluation: EvaluationSummaryRecord): WorkspaceEvaluationSummary {
  return {
    id: evaluation.id,
    title: evaluation.title,
    useCase: evaluation.useCase,
    modelProvider: evaluation.modelProvider,
    modelId: evaluation.modelId,
    overallScore: evaluation.overallScore,
    createdAt: evaluation.createdAt.toISOString(),
    updatedAt: evaluation.updatedAt.toISOString(),
  };
}

export function serializeEvaluationDetail(evaluation: EvaluationWithVersions): WorkspaceEvaluationDetail {
  return {
    ...serializeEvaluationSummary(evaluation),
    userId: evaluation.userId,
    originalPrompt: evaluation.originalPrompt,
    targetAudience: evaluation.targetAudience,
    desiredOutput: evaluation.desiredOutput,
    tone: evaluation.tone,
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
