import { z } from "zod";

export const scoreSchema = z.number().min(0).max(10);

export const evaluationOutputSchema = z.object({
  overallScore: scoreSchema,
  scores: z.object({
    clarity: scoreSchema,
    context: scoreSchema,
    specificity: scoreSchema,
    constraints: scoreSchema,
    outputFormat: scoreSchema,
    examples: scoreSchema,
    safety: scoreSchema,
    testability: scoreSchema,
  }),
  summary: z.string().min(20).max(2000),
  weaknesses: z.array(z.string().min(3)).max(12),
  recommendations: z.array(z.string().min(3)).max(12),
  improvedPrompts: z.object({
    quick: z.string().min(20).max(5000),
    structured: z.string().min(20).max(7000),
    advanced: z.string().min(20).max(9000),
  }),
  detectedRisks: z.array(z.string()).max(12),
  idealUseCase: z.string().min(3).max(200),
});

export type EvaluationOutput = z.infer<typeof evaluationOutputSchema>;

export const evaluationRequestSchema = z.object({
  prompt: z.string().min(20).max(12000),
  useCase: z.enum([
    "GENERAL",
    "CODING",
    "MARKETING",
    "EMAIL",
    "RESEARCH",
    "STUDY",
    "BUSINESS",
    "DATA_ANALYSIS",
    "CREATIVE_WRITING",
  ]),
  targetAudience: z.string().min(2).max(500),
  desiredOutput: z.string().min(2).max(500),
  tone: z.string().min(2).max(100),
  model: z
    .enum([
      "default-fast",
      "default-quality",
      "openai-fast",
      "openai-quality",
      "anthropic-quality",
      "gemini-fast",
      "gemini-quality",
    ])
    .default("default-fast"),
});

export const testPromptRequestSchema = z.object({
  promptVersionId: z.string().uuid().optional(),
  model: evaluationRequestSchema.shape.model,
});

export const promptTestOutputSchema = z.object({
  output: z.string().min(1).max(20000),
  qualityScore: z.number().int().min(0).max(10),
  comparisonNotes: z.string().min(5).max(2000),
});

export type PromptTestOutput = z.infer<typeof promptTestOutputSchema>;
