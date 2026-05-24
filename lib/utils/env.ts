export function getOptionalEnv(name: string) {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : undefined;
}

export function getAppUrl() {
  return getOptionalEnv("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000";
}

export function hasAiCredentials() {
  return Boolean(getOptionalEnv("AI_GATEWAY_API_KEY"));
}
