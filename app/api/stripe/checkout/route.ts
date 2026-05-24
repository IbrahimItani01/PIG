import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/api-session";
import { getStripe } from "@/lib/stripe";
import { getAppUrl, getOptionalEnv } from "@/lib/utils/env";
import { handleRouteError } from "@/lib/utils/http";

export async function POST() {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;
    const stripe = getStripe();

    const priceId = getOptionalEnv("STRIPE_PRO_PRICE_ID");

    if (!stripe || !priceId) {
      return NextResponse.json({
        mode: "stub",
        message: "Stripe checkout is stubbed. Add STRIPE_SECRET_KEY and STRIPE_PRO_PRICE_ID to enable checkout.",
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${getAppUrl()}/settings?checkout=success`,
      cancel_url: `${getAppUrl()}/settings?checkout=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return handleRouteError(error);
  }
}
