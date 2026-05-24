import { NextResponse } from "next/server";
import { UsageEventType } from "@prisma/client";
import type { LogicalModelId } from "@/config/models";
import { requireApiUser } from "@/lib/auth/api-session";
import { assertOwnsEvaluation } from "@/lib/auth/authorization";
import { getPrisma } from "@/lib/db/prisma";
import { testPromptRequestSchema } from "@/lib/ai/schemas";
import { testPrompt } from "@/lib/ai/test-prompt";
import { handleRouteError, jsonError } from "@/lib/utils/http";
import { isModelAllowedForPlan } from "@/lib/ai/model-registry";
import { checkMonthlyUsageLimit, recordLimitEvent } from "@/lib/billing/usage";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;
    const { id } = await params;
    const body = testPromptRequestSchema.parse(await request.json());
    const evaluation = await assertOwnsEvaluation(user.id, id);
    if (!evaluation) return jsonError("Evaluation not found.", 404);

    if (!isModelAllowedForPlan(body.model as LogicalModelId, user.plan)) {
      return jsonError("This model is not available on your current plan.", 403);
    }

    const monthlyUsage = await checkMonthlyUsageLimit({
      userId: user.id,
      plan: user.plan,
      feature: "promptTest",
      modelId: body.model,
    });
    if (!monthlyUsage.success) {
      await recordLimitEvent({
        userId: user.id,
        eventType: UsageEventType.PROMPT_TEST_RUN,
        modelId: body.model,
        reason: monthlyUsage.message ?? "monthly-limit",
      });
      return jsonError(monthlyUsage.message ?? "You have reached your monthly prompt test limit.", 429);
    }

    const version = body.promptVersionId
      ? evaluation.versions.find((item) => item.id === body.promptVersionId)
      : evaluation.versions.find((item) => item.versionType === "ADVANCED_IMPROVED");
    const prompt = version?.promptText ?? evaluation.improvedPrompt;
    const result = await testPrompt(prompt, body.model as LogicalModelId);

    const testRun = await getPrisma().promptTestRun.create({
      data: {
        evaluationId: evaluation.id,
        promptVersionId: version?.id,
        modelProvider: result.modelProvider,
        modelId: result.modelId,
        output: result.output,
        qualityScore: result.qualityScore,
        comparisonNotes: result.comparisonNotes,
        latencyMs: result.latencyMs,
      },
    });

    await getPrisma().usageEvent.create({
      data: {
        userId: user.id,
        eventType: UsageEventType.PROMPT_TEST_RUN,
        modelProvider: result.modelProvider,
        modelId: result.modelId,
        metadata: { evaluationId: evaluation.id, promptVersionId: version?.id },
      },
    });

    return NextResponse.json({ testRun });
  } catch (error) {
    return handleRouteError(error);
  }
}
