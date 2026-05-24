import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getOptionalEnv } from "@/lib/utils/env";
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
    console.info("Stripe webhook received", { type: event.type });

    return NextResponse.json({ received: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
