import { workspaceConfig } from "@/config/workspace";
import { getPrisma } from "@/lib/db/prisma";
import type { WorkspaceEvaluationSummary } from "@/lib/store/workspace-slice";
import { evaluationSummarySelect, serializeEvaluationSummary } from "@/lib/workspace/serializers";

export type EvaluationPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type EvaluationHistoryPage = {
  evaluations: WorkspaceEvaluationSummary[];
  pagination: EvaluationPagination;
};

export async function getEvaluationHistoryPage({
  userId,
  page = 1,
  pageSize = workspaceConfig.evaluationHistoryPageSize,
}: {
  userId: string;
  page?: number;
  pageSize?: number;
}): Promise<EvaluationHistoryPage> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0
    ? Math.min(Math.floor(pageSize), workspaceConfig.maxEvaluationHistoryPageSize)
    : workspaceConfig.evaluationHistoryPageSize;
  const skip = (safePage - 1) * safePageSize;
  const prisma = getPrisma();

  const [evaluations, total] = await Promise.all([
    prisma.promptEvaluation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: evaluationSummarySelect,
      skip,
      take: safePageSize,
    }),
    prisma.promptEvaluation.count({ where: { userId } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));

  return {
    evaluations: evaluations.map(serializeEvaluationSummary),
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      total,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    },
  };
}
