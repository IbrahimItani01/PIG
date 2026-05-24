import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/api-session";
import { getStripe } from "@/lib/stripe";
import { getAppUrl } from "@/lib/utils/env";
import { handleRouteError } from "@/lib/utils/http";

export async function POST() {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;
    const stripe = getStripe();

    if (!stripe) {
      return NextResponse.json({
        mode: "stub",
        message: "Stripe is not configured. Add STRIPE_SECRET_KEY and customer IDs to enable the billing portal.",
      });
    }

    const subscription = await getStripeSubscriptionCustomer(user.id);
    if (!subscription?.stripeCustomerId) {
      return NextResponse.json({ mode: "stub", message: "No Stripe customer exists for this user yet." });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${getAppUrl()}/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return handleRouteError(error);
  }
}

async function getStripeSubscriptionCustomer(userId: string) {
  const { getPrisma } = await import("@/lib/db/prisma");
  return getPrisma().subscription.findUnique({ where: { userId } });
}
