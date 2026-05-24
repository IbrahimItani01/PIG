import { describe, expect, it } from "vitest";
import { checkEvaluationRateLimit } from "@/lib/rate-limit";

describe("rate limit helper", () => {
  it("blocks requests over the anonymous limit", async () => {
    const key = `anon-test-${crypto.randomUUID()}`;
    const first = await checkEvaluationRateLimit(key);
    const second = await checkEvaluationRateLimit(key);
    const third = await checkEvaluationRateLimit(key);

    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    expect(third.success).toBe(false);
  });
});
