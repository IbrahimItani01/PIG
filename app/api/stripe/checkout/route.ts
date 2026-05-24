import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/auth/api-session";
import { getPrisma } from "@/lib/db/prisma";
import { getStripe } from "@/lib/stripe";
import { getAppUrl } from "@/lib/utils/env";
import { getStripePriceIdForPlan } from "@/lib/billing/stripe-plans";
import { handleRouteError, jsonError } from "@/lib/utils/http";

const checkoutRequestSchema = z.object({
  plan: z.enum(["PRO", "PREMIUM"]),
});

export async function POST(request: Request) {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;
    const body = checkoutRequestSchema.parse(await request.json());
    const stripe = getStripe();

    const priceId = getStripePriceIdForPlan(body.plan);

    if (!stripe || !priceId) {
      return NextResponse.json({
        mode: "stub",
        message: `Stripe checkout is stubbed. Add STRIPE_SECRET_KEY and ${body.plan === "PRO" ? "STRIPE_PRO_PRICE_ID" : "STRIPE_PREMIUM_PRICE_ID"} to enable checkout.`,
      });
    }

    const subscription = await getPrisma().subscription.findUnique({ where: { userId: user.id } });
    if (subscription?.plan === body.plan && ["ACTIVE", "TRIALING", "PAST_DUE"].includes(subscription.status)) {
      return jsonError("You are already on this plan. Use the billing portal to manage your subscription.", 409);
    }
    if (subscription?.stripeSubscriptionId && ["ACTIVE", "TRIALING", "PAST_DUE"].includes(subscription.status)) {
      return jsonError("Use the billing portal to change an existing subscription.", 409);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      ...(subscription?.stripeCustomerId ? { customer: subscription.stripeCustomerId } : { customer_email: user.email }),
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId: user.id, plan: body.plan },
      subscription_data: {
        metadata: { userId: user.id, plan: body.plan },
      },
      allow_promotion_codes: true,
      success_url: `${getAppUrl()}/billing?checkout=success`,
      cancel_url: `${getAppUrl()}/billing?checkout=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return handleRouteError(error);
  }
}
