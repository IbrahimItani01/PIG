import { NextRequest, NextResponse } from "next/server";
import { PromptVersionType, UsageEventType } from "@prisma/client";
import { messages } from "@/config/messages";
import type { LogicalModelId } from "@/config/models";
import { requireApiUser } from "@/lib/auth/api-session";
import { getPrisma } from "@/lib/db/prisma";
import { evaluationRequestSchema } from "@/lib/ai/schemas";
import { evaluatePrompt } from "@/lib/ai/evaluate-prompt";
import { getPromptVersionsFromEvaluation } from "@/lib/ai/rewrite-prompt";
import { detectSecrets } from "@/lib/utils/secrets";
import { checkEvaluationRateLimit } from "@/lib/rate-limit";
import { handleRouteError, jsonError } from "@/lib/utils/http";
import { isModelAllowedForPlan } from "@/lib/ai/model-registry";

export async function GET() {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;
    const evaluations = await getPrisma().promptEvaluation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { versions: true, testRuns: true },
      take: 100,
    });

    return NextResponse.json({ evaluations });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;
    const body = evaluationRequestSchema.parse(await request.json());
    const secrets = detectSecrets(body.prompt);

    if (secrets.length > 0) {
      return jsonError(messages.errors.secretsDetected, 422);
    }

    if (!isModelAllowedForPlan(body.model as LogicalModelId, user.plan)) {
      return jsonError("This model is not available on your current plan.", 403);
    }

    const rate = await checkEvaluationRateLimit(user.id, user.plan);
    if (!rate.success) {
      await getPrisma().usageEvent.create({
        data: {
          userId: user.id,
          eventType: UsageEventType.PROMPT_EVALUATION,
          modelProvider: "rate-limit",
          modelId: body.model,
          metadata: { rateLimited: true, limit: rate.limit, reset: rate.reset },
        },
      });
      return jsonError(messages.errors.rateLimited, 429);
    }

    const { output, model } = await evaluatePrompt(body);
    const title = body.prompt.slice(0, 72).replace(/\s+/g, " ").trim();

    const evaluation = await getPrisma().promptEvaluation.create({
      data: {
        userId: user.id,
        title: title.length > 0 ? title : "Untitled prompt",
        originalPrompt: body.prompt,
        useCase: body.useCase,
        targetAudience: body.targetAudience,
        desiredOutput: body.desiredOutput,
        tone: body.tone,
        modelProvider: model.provider,
        modelId: model.id,
        overallScore: output.overallScore,
        clarityScore: Math.round(output.scores.clarity),
        contextScore: Math.round(output.scores.context),
        specificityScore: Math.round(output.scores.specificity),
        constraintsScore: Math.round(output.scores.constraints),
        outputFormatScore: Math.round(output.scores.outputFormat),
        examplesScore: Math.round(output.scores.examples),
        safetyScore: Math.round(output.scores.safety),
        testabilityScore: Math.round(output.scores.testability),
        summary: output.summary,
        weaknesses: output.weaknesses,
        recommendations: output.recommendations,
        improvedPrompt: output.improvedPrompts.advanced,
        versions: {
          create: [
            {
              label: "Original",
              promptText: body.prompt,
              versionType: PromptVersionType.ORIGINAL,
              notes: "Original submitted prompt.",
            },
            ...getPromptVersionsFromEvaluation(output),
          ],
        },
      },
      include: { versions: true, testRuns: true },
    });

    await getPrisma().usageEvent.create({
      data: {
        userId: user.id,
        eventType: UsageEventType.PROMPT_EVALUATION,
        modelProvider: model.provider,
        modelId: model.id,
        metadata: { detectedRisks: output.detectedRisks, idealUseCase: output.idealUseCase },
      },
    });

    return NextResponse.json({ evaluation }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
