import type { Plan } from "@prisma/client";

export type PlanConfig = {
  name: Plan;
  label: string;
  description: string;
  price: string;
  priceCents: number;
  dailyEvaluations: number;
  monthlyEvaluations: number;
  monthlyPromptTests: number;
  monthlyQualityModelRuns: number;
  availableModels: string[];
  features: string[];
  cta: string;
  stripePriceEnvVar?: string;
};

export const plans: Record<Plan, PlanConfig> = {
  FREE: {
    name: "FREE",
    label: "Free",
    description: "For trying PIG with lightweight monthly usage, prompt history, and fast model access before upgrading.",
    price: "$0",
    priceCents: 0,
    dailyEvaluations: 5,
    monthlyEvaluations: 30,
    monthlyPromptTests: 10,
    monthlyQualityModelRuns: 0,
    availableModels: ["default-fast", "gemini-fast"],
    features: ["30 evaluations per month", "10 prompt tests per month", "Fast models", "Prompt history"],
    cta: "Start free",
    stripePriceEnvVar: "STRIPE_FREE_PRICE_ID",
  },
  PRO: {
    name: "PRO",
    label: "Pro",
    description: "For regular prompt improvement work with higher monthly limits, fast model routing, and advanced rewrites.",
    price: "$9",
    priceCents: 900,
    dailyEvaluations: 100,
    monthlyEvaluations: 1000,
    monthlyPromptTests: 150,
    monthlyQualityModelRuns: 0,
    availableModels: ["default-fast", "openai-fast", "gemini-fast"],
    features: ["1,000 evaluations per month", "150 prompt tests per month", "Fast model routing", "Advanced rewrites"],
    cta: "Upgrade to Pro",
    stripePriceEnvVar: "STRIPE_PRO_PRICE_ID",
  },
  PREMIUM: {
    name: "PREMIUM",
    label: "Premium",
    description: "For power users who need larger monthly quotas, all supported providers, and capped access to quality models.",
    price: "$19",
    priceCents: 1900,
    dailyEvaluations: 500,
    monthlyEvaluations: 3000,
    monthlyPromptTests: 500,
    monthlyQualityModelRuns: 150,
    availableModels: [
      "default-fast",
      "default-quality",
      "openai-fast",
      "openai-quality",
      "anthropic-quality",
      "gemini-fast",
      "gemini-quality",
    ],
    features: ["3,000 evaluations per month", "500 prompt tests per month", "150 quality model runs", "All model providers"],
    cta: "Upgrade to Premium",
    stripePriceEnvVar: "STRIPE_PREMIUM_PRICE_ID",
  },
};
