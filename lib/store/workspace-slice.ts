import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Plan, PromptUseCase, PromptVersionType, SubscriptionStatus, UsageEventType, UserRole } from "@prisma/client";
import type { ResolvedModel } from "@/lib/ai/model-registry";

export type WorkspaceUser = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: UserRole;
  plan: Plan;
  preferredModel: string;
  authProvider: string;
  emailConfirmedAt: string | null;
  lastSignInAt: string | null;
};

export type WorkspacePromptVersion = {
  id: string;
  evaluationId: string;
  label: string;
  promptText: string;
  versionType: PromptVersionType;
  notes: string | null;
  createdAt: string;
};

export type WorkspaceEvaluation = {
  id: string;
  userId: string;
  title: string;
  originalPrompt: string;
  useCase: PromptUseCase;
  targetAudience: string;
  desiredOutput: string;
  tone: string;
  modelProvider: string;
  modelId: string;
  overallScore: number;
  clarityScore: number;
  contextScore: number;
  specificityScore: number;
  constraintsScore: number;
  outputFormatScore: number;
  examplesScore: number;
  safetyScore: number;
  testabilityScore: number;
  summary: string;
  weaknesses: string[];
  recommendations: string[];
  improvedPrompt: string;
  createdAt: string;
  updatedAt: string;
  versions: WorkspacePromptVersion[];
};

export type WorkspaceUsageMetric = {
  used: number;
  limit: number;
  remaining: number;
  percent: number;
};

export type WorkspaceSubscription = {
  id: string;
  userId: string;
  plan: Plan;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  status: SubscriptionStatus;
  priceId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  cancelAt: string | null;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceUsageSummary = {
  plan: Plan;
  period: {
    start: string;
    end: string;
    source: "subscription" | "calendar";
  };
  evaluations: WorkspaceUsageMetric;
  promptTests: WorkspaceUsageMetric;
  qualityModelRuns: WorkspaceUsageMetric;
  subscription: WorkspaceSubscription | null;
};

export type WorkspaceDashboardStats = {
  totalEvaluations: number;
  averageScore: string;
  bestScore: string;
  remainingCredits: number;
};

export type WorkspaceAdminUsageEvent = {
  id: string;
  userEmail: string;
  eventType: UsageEventType;
  modelId: string | null;
  createdAt: string;
};

export type WorkspaceSnapshot = {
  user: WorkspaceUser;
  evaluations: WorkspaceEvaluation[];
  usage: WorkspaceUsageSummary;
  dashboard: WorkspaceDashboardStats;
  models: ResolvedModel[];
  adminUsageEvents: WorkspaceAdminUsageEvent[];
  hydratedAt: string;
};

export type WorkspaceState = {
  snapshot: WorkspaceSnapshot | null;
};

const initialState: WorkspaceState = {
  snapshot: null,
};

export const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    hydrateWorkspace(state, action: PayloadAction<WorkspaceSnapshot>) {
      state.snapshot = action.payload;
    },
    upsertWorkspaceEvaluation(state, action: PayloadAction<WorkspaceEvaluation>) {
      if (!state.snapshot) return;

      const existingIndex = state.snapshot.evaluations.findIndex((evaluation) => evaluation.id === action.payload.id);
      if (existingIndex >= 0) {
        state.snapshot.evaluations[existingIndex] = action.payload;
      } else {
        state.snapshot.evaluations.unshift(action.payload);
        state.snapshot.evaluations = state.snapshot.evaluations.slice(0, 100);
      }
    },
  },
});

export const { hydrateWorkspace, upsertWorkspaceEvaluation } = workspaceSlice.actions;
