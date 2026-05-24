import type { EvaluationOutput } from "@/lib/ai/schemas";

export function getPromptVersionsFromEvaluation(output: EvaluationOutput) {
  return [
    { label: "Quick improved", versionType: "QUICK_IMPROVED" as const, promptText: output.improvedPrompts.quick },
    { label: "Structured improved", versionType: "STRUCTURED_IMPROVED" as const, promptText: output.improvedPrompts.structured },
    { label: "Advanced improved", versionType: "ADVANCED_IMPROVED" as const, promptText: output.improvedPrompts.advanced },
  ];
}
