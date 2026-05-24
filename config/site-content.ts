import { brand } from "@/config/brand";
import { plans } from "@/config/plans";

export const siteContent = {
  hero: {
    title: brand.fullName,
    subtitle: brand.tagline,
    body:
      "Score prompt quality with a transparent rubric, see what is weak, and generate better versions before you spend tokens on unreliable output.",
    primaryCta: "Grade a prompt",
    secondaryCta: "View rubric",
  },
  explanation: [
    "Paste a prompt and describe its use case, audience, output format, and tone.",
    "PIG grades clarity, context, specificity, constraints, format, examples, safety, and testability.",
    "Save the evaluation, compare rewrite versions, and reuse stronger prompt patterns.",
  ],
  beforeAfter: {
    before: "Write me a marketing email for our product.",
    after:
      "Write a concise B2B SaaS launch email for operations leaders at mid-market companies. Use a confident but practical tone, include one clear CTA, keep it under 180 words, and format with subject line, preview text, and body.",
  },
  features: [
    {
      title: "Transparent scoring",
      description: "Weighted rubric cards explain exactly why a prompt scored well or poorly.",
    },
    {
      title: "Provider-aware AI",
      description: "Route evaluations through default, OpenAI, Anthropic, or Gemini model options server-side.",
    },
    {
      title: "History and usage",
      description: "Track prompt scores, plan limits, usage events, and rewrite versions per user.",
    },
    {
      title: "Production-light security",
      description: "Supabase Auth, Prisma ownership checks, Zod validation, rate limits, and secret detection.",
    },
  ],
  pricing: Object.values(plans).map((plan) => ({
    name: plan.label,
    price: plan.price,
    cta: plan.cta,
    features: plan.features,
  })),
  faq: [
    {
      question: "Does PIG store prompts?",
      answer: "Authenticated evaluations are saved to your history. You can delete evaluations from the API and database.",
    },
    {
      question: "Can I use my preferred AI provider?",
      answer: "Yes. The model registry supports default, OpenAI, Anthropic, and Gemini routes with environment-controlled model IDs.",
    },
    {
      question: "Is Stripe fully live?",
      answer: "The schema and routes are Stripe-ready stubs. Add live keys and checkout price IDs to enable billing.",
    },
  ],
  footerLinks: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Settings", href: "/settings" },
    { label: "Admin", href: "/admin" },
  ],
} as const;
