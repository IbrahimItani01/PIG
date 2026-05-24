export const messages = {
  success: {
    evaluationSaved: "Evaluation saved.",
    copied: "Copied to clipboard.",
  },
  errors: {
    generic: "Something went wrong. Please try again.",
    authRequired: "You need to sign in to continue.",
    forbidden: "You do not have access to this resource.",
    rateLimited: "You have reached your evaluation limit for this plan.",
    secretsDetected: "This prompt appears to contain a secret or credential. Remove sensitive data before evaluating.",
    invalidInput: "Check the form and try again.",
    aiUnavailable: "The AI provider is unavailable. Try a different model or retry later.",
  },
  empty: {
    evaluations: "No evaluations yet. Grade a prompt to start building history.",
    usage: "No usage events have been recorded yet.",
  },
  warnings: {
    sensitiveData: "Do not paste passwords, private keys, API keys, customer records, or other sensitive personal data.",
  },
} as const;
