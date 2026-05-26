import { getPrisma } from "@/lib/db/prisma";

export async function assertOwnsEvaluation(userId: string, evaluationId: string) {
  const evaluation = await getPrisma().promptEvaluation.findFirst({
    where: { id: evaluationId, userId },
    include: { versions: { orderBy: { createdAt: "asc" } } },
  });

  return evaluation;
}
