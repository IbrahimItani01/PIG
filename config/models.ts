export type ModelProvider = "default" | "openai" | "anthropic" | "gemini";

export type LogicalModelId =
  | "default-fast"
  | "default-quality"
  | "openai-fast"
  | "openai-quality"
  | "anthropic-quality"
  | "gemini-fast"
  | "gemini-quality";

export type ModelConfig = {
  id: LogicalModelId;
  provider: ModelProvider;
  displayName: string;
  envVar?: string;
  defaultModelId: string;
  tier: "FREE" | "PRO" | "PREMIUM";
  costNote: string;
  fallback?: LogicalModelId;
};

export const modelConfigs: Record<LogicalModelId, ModelConfig> = {
  "default-fast": {
    id: "default-fast",
    provider: "default",
    displayName: "Default fast",
    defaultModelId: "openai/gpt-5-mini",
    tier: "FREE",
    costNote: "Lowest latency default route.",
    fallback: "gemini-fast",
  },
  "default-quality": {
    id: "default-quality",
    provider: "default",
    displayName: "Default quality",
    defaultModelId: "openai/gpt-5.5",
    tier: "PREMIUM",
    costNote: "Higher quality default route.",
    fallback: "openai-quality",
  },
  "openai-fast": {
    id: "openai-fast",
    provider: "openai",
    displayName: "OpenAI fast",
    envVar: "OPENAI_FAST_MODEL",
    defaultModelId: "gpt-5-mini",
    tier: "PRO",
    costNote: "OpenAI low-latency model.",
  },
  "openai-quality": {
    id: "openai-quality",
    provider: "openai",
    displayName: "OpenAI quality",
    envVar: "OPENAI_QUALITY_MODEL",
    defaultModelId: "gpt-5.5",
    tier: "PREMIUM",
    costNote: "OpenAI quality model.",
  },
  "anthropic-quality": {
    id: "anthropic-quality",
    provider: "anthropic",
    displayName: "Anthropic quality",
    envVar: "ANTHROPIC_QUALITY_MODEL",
    defaultModelId: "claude-sonnet-4-20250514",
    tier: "PREMIUM",
    costNote: "Anthropic quality route.",
  },
  "gemini-fast": {
    id: "gemini-fast",
    provider: "gemini",
    displayName: "Gemini fast",
    envVar: "GEMINI_FAST_MODEL",
    defaultModelId: "gemini-2.5-flash",
    tier: "FREE",
    costNote: "Google Gemini fast model.",
  },
  "gemini-quality": {
    id: "gemini-quality",
    provider: "gemini",
    displayName: "Gemini quality",
    envVar: "GEMINI_QUALITY_MODEL",
    defaultModelId: "gemini-2.5-pro",
    tier: "PREMIUM",
    costNote: "Google Gemini quality model.",
  },
};
