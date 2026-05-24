import { NextResponse } from "next/server";
import { z } from "zod";
import { modelConfigs, type LogicalModelId, type ModelProvider } from "@/config/models";
import { requireApiUser } from "@/lib/auth/api-session";
import { getPrisma } from "@/lib/db/prisma";
import { isModelAllowedForPlan } from "@/lib/ai/model-registry";
import { handleRouteError, jsonError } from "@/lib/utils/http";

const accountUpdateSchema = z.object({
  name: z.string().trim().max(80, "Name must be 80 characters or fewer.").optional(),
  preferredModel: z.enum([
    "default-fast",
    "default-quality",
    "openai-fast",
    "openai-quality",
    "anthropic-quality",
    "gemini-fast",
    "gemini-quality",
  ]).optional(),
});

export async function PATCH(request: Request) {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;

    const body = accountUpdateSchema.parse(await request.json());
    const data: {
      name?: string | null;
      preferredModel?: LogicalModelId;
      preferredProvider?: ModelProvider;
    } = {};

    if ("name" in body) {
      data.name = body.name && body.name.length > 0 ? body.name : null;
    }

    if (body.preferredModel) {
      if (!isModelAllowedForPlan(body.preferredModel, user.plan)) {
        return jsonError("This preferred model is not available on your current plan.", 403);
      }

      const model = modelConfigs[body.preferredModel];
      data.preferredModel = body.preferredModel;
      data.preferredProvider = model.provider;
    }

    const updated = await getPrisma().user.update({
      where: { id: user.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        preferredProvider: true,
        preferredModel: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    return handleRouteError(error);
  }
}
