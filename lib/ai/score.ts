import { rubricWeights, type RubricKey } from "@/config/rubric";

export function calculateWeightedScore(scores: Record<RubricKey, number>) {
  const total = Object.entries(rubricWeights).reduce((sum, [key, weight]) => {
    return sum + scores[key as RubricKey] * weight;
  }, 0);

  return Math.round(total * 10) / 10;
}
