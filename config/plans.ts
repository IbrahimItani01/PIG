import type { Plan } from "@prisma/client";

export type PlanConfig = {
  name: Plan;
  label: string;
  price: string;
  dailyEvaluations: number;
  monthlyEvaluations: number;
  availableModels: string[];
  features: string[];
  cta: string;
};

export const plans: Record<Plan, PlanConfig> = {
  FREE: {
    name: "FREE",
    label: "Free",
    price: "$0",
    dailyEvaluations: 5,
    monthlyEvaluations: 100,
    availableModels: ["default-fast", "gemini-fast"],
    features: ["5 evaluations per day", "Prompt history", "Quick rewrites"],
    cta: "Start free",
  },
  PRO: {
    name: "PRO",
    label: "Pro",
    price: "$19",
    dailyEvaluations: 100,
    monthlyEvaluations: 3000,
    availableModels: ["default-fast", "default-quality", "openai-quality", "gemini-quality"],
    features: ["100 evaluations per day", "Advanced rewrites", "Prompt testing", "Priority models"],
    cta: "Upgrade to Pro",
  },
  PREMIUM: {
    name: "PREMIUM",
    label: "Premium",
    price: "$49",
    dailyEvaluations: 500,
    monthlyEvaluations: 15000,
    availableModels: [
      "default-fast",
      "default-quality",
      "openai-fast",
      "openai-quality",
      "anthropic-quality",
      "gemini-fast",
      "gemini-quality",
    ],
    features: ["500 evaluations per day", "All model providers", "Team-ready limits", "Export-ready history"],
    cta: "Contact sales",
  },
};
