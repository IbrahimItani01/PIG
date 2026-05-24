import Stripe from "stripe";
import { getOptionalEnv } from "@/lib/utils/env";

let stripe: Stripe | null = null;

export function getStripe() {
  const key = getOptionalEnv("STRIPE_SECRET_KEY");
  if (!key) return null;
  stripe ??= new Stripe(key);
  return stripe;
}
