import { describe, expect, it } from "vitest";
import { evaluatePrompt } from "@/lib/ai/evaluate-prompt";

describe("evaluatePrompt", () => {
  it("returns valid structured output in local fallback mode", async () => {
    const result = await evaluatePrompt({
      prompt:
        "Write a concise product update email for existing SaaS customers. Include subject line, preview text, body, one CTA, and keep it under 180 words.",
      useCase: "EMAIL",
      targetAudience: "Existing SaaS customers",
      desiredOutput: "Email",
      tone: "Professional",
      model: "default-fast",
    });

    expect(result.output.overallScore).toBeGreaterThan(0);
    expect(result.output.improvedPrompts.advanced).toContain("Quality bar");
  });
});
