import { describe, expect, it } from "vitest";
import { getAllowedModels, resolveModel } from "@/lib/ai/model-registry";

describe("model registry", () => {
  it("resolves provider-prefixed gateway model IDs", () => {
    const model = resolveModel("gemini-fast");
    expect(model.gatewayModel).toContain("google/");
  });

  it("limits free plan model options", () => {
    const models = getAllowedModels("FREE").map((model) => model.id);
    expect(models).toContain("default-fast");
    expect(models).not.toContain("anthropic-quality");
  });
});
