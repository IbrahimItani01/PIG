import type { PromptUseCase } from "@prisma/client";

export const toneOptions = ["Professional", "Concise", "Friendly", "Analytical", "Persuasive", "Technical"] as const;

export const outputFormats = ["Paragraphs", "Bullet list", "Table", "JSON", "Markdown", "Step-by-step plan"] as const;

export const useCaseConfig: Record<
  PromptUseCase,
  { label: string; description: string; suggestedOutputs: string[]; templateExample: string }
> = {
  GENERAL: {
    label: "General",
    description: "Broad prompts for everyday AI assistance.",
    suggestedOutputs: ["Bullet list", "Step-by-step plan"],
    templateExample: "Help me think through ...",
  },
  CODING: {
    label: "Coding",
    description: "Engineering, debugging, refactoring, and code review prompts.",
    suggestedOutputs: ["Markdown", "Step-by-step plan"],
    templateExample: "Review this function for correctness and edge cases ...",
  },
  MARKETING: {
    label: "Marketing",
    description: "Positioning, copywriting, campaigns, and audience messaging.",
    suggestedOutputs: ["Table", "Bullet list"],
    templateExample: "Create landing page copy for ...",
  },
  EMAIL: {
    label: "Email",
    description: "Outreach, replies, follow-ups, and internal communication.",
    suggestedOutputs: ["Paragraphs", "Markdown"],
    templateExample: "Draft a concise email to ...",
  },
  RESEARCH: {
    label: "Research",
    description: "Synthesis, source analysis, and research planning.",
    suggestedOutputs: ["Table", "Markdown"],
    templateExample: "Summarize the research question, evidence, and gaps ...",
  },
  STUDY: {
    label: "Study",
    description: "Learning plans, explanations, quizzes, and notes.",
    suggestedOutputs: ["Step-by-step plan", "Bullet list"],
    templateExample: "Teach me ...",
  },
  BUSINESS: {
    label: "Business",
    description: "Strategy, operations, product, finance, and planning prompts.",
    suggestedOutputs: ["Table", "Markdown"],
    templateExample: "Evaluate this business decision ...",
  },
  DATA_ANALYSIS: {
    label: "Data analysis",
    description: "Analysis plans, data interpretation, SQL, and reporting.",
    suggestedOutputs: ["Table", "JSON"],
    templateExample: "Analyze this dataset and identify ...",
  },
  CREATIVE_WRITING: {
    label: "Creative writing",
    description: "Narrative, brainstorming, tone, and editing prompts.",
    suggestedOutputs: ["Paragraphs", "Markdown"],
    templateExample: "Write a scene that ...",
  },
};
