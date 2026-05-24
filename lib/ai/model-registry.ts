import { modelConfigs, type LogicalModelId, type ModelConfig } from "@/config/models";
import { plans } from "@/config/plans";
import { getOptionalEnv } from "@/lib/utils/env";
import type { Plan } from "@prisma/client";

export type ResolvedModel = ModelConfig & {
  actualModelId: string;
  gatewayModel: string;
};

export function getModelConfig(id: LogicalModelId) {
  return modelConfigs[id];
}

export function resolveModel(id: LogicalModelId): ResolvedModel {
  const config = getModelConfig(id);
  const actualModelId = config.envVar ? getOptionalEnv(config.envVar) ?? config.defaultModelId : config.defaultModelId;
  const providerPrefix =
    config.provider === "default"
      ? ""
      : config.provider === "gemini"
        ? "google/"
        : `${config.provider}/`;

  return {
    ...config,
    actualModelId,
    gatewayModel: actualModelId.includes("/") ? actualModelId : `${providerPrefix}${actualModelId}`,
  };
}

export function isQualityModel(id: LogicalModelId | string) {
  return id.includes("quality");
}

export function isModelAllowedForPlan(modelId: LogicalModelId, plan: Plan) {
  return plans[plan].availableModels.includes(modelId);
}

export function getAllowedModels(plan: Plan) {
  return plans[plan].availableModels.map((id) => resolveModel(id as LogicalModelId));
}
