import { NextResponse } from "next/server";
import { Plan, type SubscriptionStatus } from "@prisma/client";
import type Stripe from "stripe";
import { getPrisma } from "@/lib/db/prisma";
import { getStripe } from "@/lib/stripe";
import { getOptionalEnv } from "@/lib/utils/env";
import { getPlanByStripePriceId } from "@/lib/billing/stripe-plans";
import { handleRouteError, jsonError } from "@/lib/utils/http";

export async function POST(request: Request) {
  try {
    const stripe = getStripe();
    const secret = getOptionalEnv("STRIPE_WEBHOOK_SECRET");

    if (!stripe || !secret) {
      return NextResponse.json({ mode: "stub", received: true });
    }

    const signature = request.headers.get("stripe-signature");
    if (!signature) return jsonError("Missing Stripe signature.", 400);

    const payload = await request.text();
    const event = stripe.webhooks.constructEvent(payload, signature, secret);

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(stripe, event.data.object);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncStripeSubscription(event.data.object);
        break;
      default:
        console.info("Stripe webhook ignored", { type: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return handleRouteError(error);
  }
}

async function handleCheckoutCompleted(stripe: Stripe, session: Stripe.Checkout.Session) {
  if (session.mode !== "subscription" || !session.subscription) return;

  const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await syncStripeSubscription(subscription, session.metadata?.userId ?? session.client_reference_id ?? undefined);

  const previousSubscriptionId = session.metadata?.previousSubscriptionId;
  if (previousSubscriptionId && previousSubscriptionId !== subscription.id) {
    await stripe.subscriptions.cancel(previousSubscriptionId);
  }
}

async function syncStripeSubscription(subscription: Stripe.Subscription, explicitUserId?: string) {
  const prisma = getPrisma();
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const priceId = subscription.items.data[0]?.price.id ?? null;
  const plan = getPlanByStripePriceId(priceId) ?? parsePlan(subscription.metadata.plan) ?? Plan.FREE;
  const status = mapStripeStatus(subscription.status);
  const subscriptionAny = subscription as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
    cancel_at?: number | null;
    canceled_at?: number | null;
  };

  const existing = explicitUserId
    ? null
    : await prisma.subscription.findFirst({
        where: {
          OR: [{ stripeSubscriptionId: subscription.id }, { stripeCustomerId: customerId }],
        },
      });
  const userId = explicitUserId ?? existing?.userId;
  if (existing?.stripeSubscriptionId && existing.stripeSubscriptionId !== subscription.id && subscription.status === "canceled") {
    return;
  }

  if (!userId) {
    console.warn("Stripe subscription webhook could not be matched to a user", {
      subscriptionId: subscription.id,
      customerId,
    });
    return;
  }

  const activePlan = status === "ACTIVE" || status === "TRIALING" || status === "PAST_DUE" ? plan : Plan.FREE;

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
    prisma.user.update({
      where: { id: userId },
      data: { plan: activePlan },
    }),
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

function parsePlan(value?: string | null): Plan | null {
  if (value === "FREE" || value === "PRO" || value === "PREMIUM") return value;
  return null;
}

function unixToDate(value?: number | null) {
  return value ? new Date(value * 1000) : null;
}
