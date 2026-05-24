import { describe, expect, it } from "vitest";
import { evaluationOutputSchema, evaluationRequestSchema } from "@/lib/ai/schemas";

describe("zod schemas", () => {
  it("rejects short prompt inputs", () => {
    expect(() =>
      evaluationRequestSchema.parse({
        prompt: "too short",
        useCase: "GENERAL",
        targetAudience: "Teams",
        desiredOutput: "Markdown",
        tone: "Professional",
        model: "default-fast",
      }),
    ).toThrow();
  });

  it("accepts valid AI structured output", () => {
    const parsed = evaluationOutputSchema.parse({
      overallScore: 8,
      scores: {
        clarity: 8,
        context: 8,
        specificity: 8,
        constraints: 8,
        outputFormat: 8,
        examples: 8,
        safety: 8,
        testability: 8,
      },
      summary: "This prompt is clear and includes enough details for a useful response.",
      weaknesses: ["Could include a compact example."],
      recommendations: ["Add one sample input and output."],
      improvedPrompts: {
        quick: "Improve the prompt with audience, tone, and output format included.",
        structured: "Task: improve this prompt.\nAudience: product teams.\nOutput: markdown.",
        advanced: "Task: improve this prompt with constraints, assumptions, and acceptance criteria.",
      },
      detectedRisks: [],
      idealUseCase: "General",
    });

    expect(parsed.overallScore).toBe(8);
  });
});
