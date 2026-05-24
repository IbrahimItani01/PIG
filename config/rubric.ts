export const rubricWeights = {
  clarity: 0.2,
  context: 0.15,
  specificity: 0.15,
  constraints: 0.1,
  outputFormat: 0.15,
  examples: 0.1,
  safety: 0.1,
  testability: 0.05,
} as const;

export type RubricKey = keyof typeof rubricWeights;

export const rubricConfig: Record<
  RubricKey,
  { label: string; description: string; recommendationTemplate: string }
> = {
  clarity: {
    label: "Clarity",
    description: "How clearly the request states the task and expected behavior.",
    recommendationTemplate: "State the exact task in direct language and remove ambiguity.",
  },
  context: {
    label: "Context",
    description: "Whether the model receives enough background to answer well.",
    recommendationTemplate: "Add relevant background, constraints, source material, or assumptions.",
  },
  specificity: {
    label: "Specificity",
    description: "How precisely the prompt defines scope, inputs, and success criteria.",
    recommendationTemplate: "Name the audience, scope, and criteria that define a good answer.",
  },
  constraints: {
    label: "Constraints",
    description: "Whether the prompt sets boundaries, exclusions, and required decisions.",
    recommendationTemplate: "Add clear limits, exclusions, and any must-follow requirements.",
  },
  outputFormat: {
    label: "Output format",
    description: "How well the desired structure and format are specified.",
    recommendationTemplate: "Specify headings, format, length, schema, or examples of the final output.",
  },
  examples: {
    label: "Examples",
    description: "Whether useful examples or counterexamples are included.",
    recommendationTemplate: "Include a compact example or sample input/output when it reduces uncertainty.",
  },
  safety: {
    label: "Safety",
    description: "Whether the prompt avoids sensitive data and unsafe requests.",
    recommendationTemplate: "Remove secrets or personal data and add safety boundaries where needed.",
  },
  testability: {
    label: "Testability",
    description: "How easy it is to evaluate whether the output succeeded.",
    recommendationTemplate: "Add measurable acceptance criteria or a checklist for success.",
  },
};

export const scoreInterpretations = [
  { min: 9, label: "Excellent", tone: "Ready for production use" },
  { min: 7, label: "Strong", tone: "Useful with small refinements" },
  { min: 5, label: "Needs work", tone: "Likely to produce uneven results" },
  { min: 0, label: "Weak", tone: "Requires restructuring before use" },
] as const;
