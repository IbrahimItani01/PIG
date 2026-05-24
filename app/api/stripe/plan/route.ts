import { NextResponse } from "next/server";
import { Plan, type SubscriptionStatus } from "@prisma/client";
import type Stripe from "stripe";
import { z } from "zod";
import { plans } from "@/config/plans";
import { requireApiUser } from "@/lib/auth/api-session";
import { getPrisma } from "@/lib/db/prisma";
import { getStripe } from "@/lib/stripe";
import { getAppUrl } from "@/lib/utils/env";
import { getStripePriceIdForPlan } from "@/lib/billing/stripe-plans";
import { handleRouteError } from "@/lib/utils/http";

const planRequestSchema = z.object({
  plan: z.enum(["FREE", "PRO", "PREMIUM"]),
});

const activeStatuses: SubscriptionStatus[] = ["ACTIVE", "TRIALING", "PAST_DUE"];

export async function POST(request: Request) {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;

    const { plan } = planRequestSchema.parse(await request.json());
    const stripe = getStripe();
    const priceId = getStripePriceIdForPlan(plan);
    const prisma = getPrisma();
    const existing = await prisma.subscription.findUnique({ where: { userId: user.id } });

    if (!stripe || !priceId) {
      if (plan === "FREE") {
        await prisma.$transaction([
          prisma.subscription.upsert({
            where: { userId: user.id },
            update: { plan, status: "ACTIVE", priceId: priceId ?? null },
            create: { userId: user.id, plan, status: "ACTIVE", priceId: priceId ?? null },
          }),
          prisma.user.update({ where: { id: user.id }, data: { plan } }),
        ]);

        return NextResponse.json({
          mode: "local",
          plan,
          message: "Free plan activated locally. Add STRIPE_FREE_PRICE_ID and STRIPE_SECRET_KEY to track it in Stripe.",
        });
      }

      return NextResponse.json({
        mode: "stub",
        plan,
        message: `Stripe is not configured for ${plans[plan].label}. Add STRIPE_SECRET_KEY and ${plans[plan].stripePriceEnvVar}.`,
      });
    }

    if (existing?.plan === plan && activeStatuses.includes(existing.status)) {
      return NextResponse.json({ mode: "current", plan, message: "You are already on this plan." });
    }

    if (!existing?.stripeSubscriptionId || !activeStatuses.includes(existing.status)) {
      if (plan === "FREE") {
        const subscription = await createFreeSubscription(stripe, {
          userId: user.id,
          email: user.email,
          existingCustomerId: existing?.stripeCustomerId,
          priceId,
        });
        await persistStripeSubscription(subscription, user.id, plan);
        return NextResponse.json({ mode: "activated", plan, redirectTo: "/dashboard" });
      }

      const session = await createCheckoutSession(stripe, {
        userId: user.id,
        email: user.email,
        customerId: existing?.stripeCustomerId,
        priceId,
        plan,
      });
      return NextResponse.json({ mode: "checkout", plan, url: session.url });
    }

    const currentStripeSubscription = await stripe.subscriptions.retrieve(existing.stripeSubscriptionId);

    if (existing.plan === "FREE" && plan !== "FREE") {
      const session = await createCheckoutSession(stripe, {
        userId: user.id,
        email: user.email,
        customerId: existing.stripeCustomerId,
        priceId,
        plan,
        previousSubscriptionId: existing.stripeSubscriptionId,
      });
      return NextResponse.json({ mode: "checkout", plan, url: session.url });
    }

    const itemId = currentStripeSubscription.items.data[0]?.id;
    if (!itemId) {
      return NextResponse.json({ mode: "stub", message: "Stripe subscription has no subscription item to update." }, { status: 409 });
    }

    const updated = await stripe.subscriptions.update(existing.stripeSubscriptionId, {
      cancel_at_period_end: false,
      items: [{ id: itemId, price: priceId }],
      metadata: { userId: user.id, plan },
      proration_behavior: "create_prorations",
    });
    await persistStripeSubscription(updated, user.id, plan);

    return NextResponse.json({ mode: "updated", plan, redirectTo: "/billing" });
  } catch (error) {
    return handleRouteError(error);
  }
}

async function createFreeSubscription(
  stripe: Stripe,
  {
    userId,
    email,
    existingCustomerId,
    priceId,
  }: {
    userId: string;
    email: string;
    existingCustomerId?: string | null;
    priceId: string;
  },
) {
  const customerId = existingCustomerId ?? (await stripe.customers.create({ email, metadata: { userId } })).id;

  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    metadata: { userId, plan: "FREE" },
  });
}

async function createCheckoutSession(
  stripe: Stripe,
  {
    userId,
    email,
    customerId,
    priceId,
    plan,
    previousSubscriptionId,
  }: {
    userId: string;
    email: string;
    customerId?: string | null;
    priceId: string;
    plan: Exclude<Plan, "FREE">;
    previousSubscriptionId?: string;
  },
) {
  return stripe.checkout.sessions.create({
    mode: "subscription",
    ...(customerId ? { customer: customerId } : { customer_email: email }),
    client_reference_id: userId,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { userId, plan, previousSubscriptionId: previousSubscriptionId ?? "" },
    subscription_data: {
      metadata: { userId, plan },
    },
    allow_promotion_codes: true,
    success_url: `${getAppUrl()}/billing?checkout=success`,
    cancel_url: `${getAppUrl()}/billing?checkout=cancelled`,
  });
}

async function persistStripeSubscription(subscription: Stripe.Subscription, userId: string, fallbackPlan: Plan) {
  const prisma = getPrisma();
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const priceId = subscription.items.data[0]?.price.id ?? null;
  const subscriptionAny = subscription as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
    cancel_at?: number | null;
    canceled_at?: number | null;
  };
  const status = mapStripeStatus(subscription.status);
  const activePlan = activeStatuses.includes(status) ? fallbackPlan : Plan.FREE;

  await prisma.$transaction([
    prisma.subscription.upsert({
      where: { userId },
      update: {
        plan: activePlan,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        status,
        priceId,
        currentPeriodStart: unixToDate(subscriptionAny.current_period_start),
        currentPeriodEnd: unixToDate(subscriptionAny.current_period_end),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        cancelAt: unixToDate(subscriptionAny.cancel_at),
        canceledAt: unixToDate(subscriptionAny.canceled_at),
      },
      create: {
        userId,
        plan: activePlan,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        status,
        priceId,
        currentPeriodStart: unixToDate(subscriptionAny.current_period_start),
        currentPeriodEnd: unixToDate(subscriptionAny.current_period_end),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        cancelAt: unixToDate(subscriptionAny.cancel_at),
        canceledAt: unixToDate(subscriptionAny.canceled_at),
      },
    }),
    prisma.user.update({ where: { id: userId }, data: { plan: activePlan } }),
  ]);
}

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "trialing":
      return "TRIALING";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
      return "CANCELED";
    default:
      return "INACTIVE";
  }
}

function unixToDate(value?: number | null) {
  return value ? new Date(value * 1000) : null;
}
