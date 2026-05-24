import { describe, expect, it } from "vitest";
import { calculateWeightedScore } from "@/lib/ai/score";

describe("calculateWeightedScore", () => {
  it("applies rubric weights and rounds to one decimal", () => {
    expect(
      calculateWeightedScore({
        clarity: 10,
        context: 8,
        specificity: 8,
        constraints: 6,
        outputFormat: 8,
        examples: 4,
        safety: 10,
        testability: 6,
      }),
    ).toBe(7.9);
  });
});
