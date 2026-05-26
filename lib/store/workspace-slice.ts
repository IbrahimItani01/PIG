import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Plan, PromptUseCase, PromptVersionType, SubscriptionStatus, UsageEventType, UserRole } from "@prisma/client";
import { workspaceConfig } from "@/config/workspace";
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

export type WorkspaceEvaluationSummary = {
  id: string;
  title: string;
  useCase: PromptUseCase;
  modelProvider: string;
  modelId: string;
  overallScore: number;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceEvaluationDetail = WorkspaceEvaluationSummary & {
  userId: string;
  originalPrompt: string;
  targetAudience: string;
  desiredOutput: string;
  tone: string;
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
  status: SubscriptionStatus;
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
  canOpenPortal: boolean;
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
  recentEvaluations: WorkspaceEvaluationSummary[];
  usage: WorkspaceUsageSummary;
  dashboard: WorkspaceDashboardStats;
  models: ResolvedModel[];
  adminUsageEvents: WorkspaceAdminUsageEvent[];
  hydratedAt: string;
};

export type WorkspaceState = {
  snapshot: WorkspaceSnapshot | null;
  evaluationDetails: Record<string, WorkspaceEvaluationDetail>;
};

const initialState: WorkspaceState = {
  snapshot: null,
  evaluationDetails: {},
};

export const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    hydrateWorkspace(state, action: PayloadAction<WorkspaceSnapshot>) {
      state.snapshot = action.payload;
    },
    upsertWorkspaceEvaluationSummary(state, action: PayloadAction<WorkspaceEvaluationSummary>) {
      if (!state.snapshot) return;

      const existingIndex = state.snapshot.recentEvaluations.findIndex((evaluation) => evaluation.id === action.payload.id);
      if (existingIndex >= 0) {
        state.snapshot.recentEvaluations[existingIndex] = action.payload;
      } else {
        state.snapshot.recentEvaluations.unshift(action.payload);
        state.snapshot.recentEvaluations = state.snapshot.recentEvaluations.slice(0, workspaceConfig.recentEvaluationsLimit);
      }
    },
    cacheWorkspaceEvaluationDetail(state, action: PayloadAction<WorkspaceEvaluationDetail>) {
      state.evaluationDetails[action.payload.id] = action.payload;
    },
  },
});

export const { cacheWorkspaceEvaluationDetail, hydrateWorkspace, upsertWorkspaceEvaluationSummary } = workspaceSlice.actions;
