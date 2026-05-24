import { NextResponse } from "next/server";
import type { SubscriptionStatus } from "@prisma/client";
import { z } from "zod";
import { modelConfigs, type LogicalModelId, type ModelProvider } from "@/config/models";
import { requireApiUser } from "@/lib/auth/api-session";
import { createSupabaseAdminClient } from "@/lib/auth/supabase-server";
import { getPrisma } from "@/lib/db/prisma";
import { getStripe } from "@/lib/stripe";
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

const accountDeleteSchema = z.object({
  confirmation: z.string().trim(),
});

const activeSubscriptionStatuses: SubscriptionStatus[] = ["ACTIVE", "TRIALING", "PAST_DUE"];

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

export async function DELETE(request: Request) {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;

    const body = accountDeleteSchema.parse(await request.json());
    if (body.confirmation !== user.email) {
      return jsonError("Type your email address exactly to confirm account deletion.", 422);
    }

    const supabaseAdmin = createSupabaseAdminClient();
    if (!supabaseAdmin) {
      return jsonError("Account deletion requires SUPABASE_SERVICE_ROLE_KEY to be configured.", 503);
    }

    const prisma = getPrisma();
    const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });

    if (subscription?.stripeSubscriptionId && activeSubscriptionStatuses.includes(subscription.status)) {
      const stripe = getStripe();
      if (!stripe) {
        return jsonError("Account deletion requires Stripe to be configured so the active subscription can be canceled.", 503);
      }

      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    }

    await prisma.user.delete({ where: { id: user.id } });

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.authId);
    if (deleteError) {
      console.error("Supabase auth user deletion failed after app data deletion", {
        userId: user.id,
        authId: user.authId,
        error: deleteError.message,
      });
      return jsonError("App data was deleted, but the auth account could not be removed. Contact support.", 500);
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
