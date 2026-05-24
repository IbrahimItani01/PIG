import { PrismaClient, PromptUseCase, PromptVersionType, UsageEventType } from "@prisma/client";
import { useCaseConfig } from "../config/use-cases";

const prisma = new PrismaClient();

async function main() {
  await prisma.promptTemplate.upsert({
    where: { slug: "coding-review" },
    update: {},
    create: {
      name: "Coding review prompt",
      slug: "coding-review",
      category: "CODING",
      description: "A reusable prompt for reviewing code correctness, edge cases, and maintainability.",
      templateText:
        "Review the following code for correctness, edge cases, security issues, and maintainability. Return findings ordered by severity with file/line references when available.",
      isPublic: true,
    },
  });

  await prisma.promptTemplate.upsert({
    where: { slug: "marketing-email" },
    update: {},
    create: {
      name: "Marketing email prompt",
      slug: "marketing-email",
      category: "MARKETING",
      description: "A prompt template for clear, audience-specific SaaS email drafts.",
      templateText:
        "Write a concise email for [audience] about [offer]. Use a [tone] tone, include one primary CTA, and format with subject line, preview text, and body.",
      isPublic: true,
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@promptintelligentgrader.com" },
    update: {},
    create: {
      email: "demo@promptintelligentgrader.com",
      name: "Demo User",
      plan: "PRO",
      preferredProvider: "default",
      preferredModel: "default-fast",
    },
  });

  const existing = await prisma.promptEvaluation.findFirst({
    where: { userId: demoUser.id, title: "Demo marketing email evaluation" },
  });

  if (!existing) {
    const evaluation = await prisma.promptEvaluation.create({
      data: {
        userId: demoUser.id,
        title: "Demo marketing email evaluation",
        originalPrompt: "Write me a marketing email for our product.",
        useCase: PromptUseCase.MARKETING,
        targetAudience: "Operations leaders at mid-market SaaS companies",
        desiredOutput: "Email with subject, preview text, and body",
        tone: "Professional",
        modelProvider: "default",
        modelId: "default-fast",
        overallScore: 5.9,
        clarityScore: 6,
        contextScore: 4,
        specificityScore: 5,
        constraintsScore: 4,
        outputFormatScore: 7,
        examplesScore: 3,
        safetyScore: 9,
        testabilityScore: 5,
        summary: "The prompt has a clear goal but lacks audience, product context, constraints, and success criteria.",
        weaknesses: ["No audience or product context", "No length or CTA constraints", "No success criteria"],
        recommendations: [
          useCaseConfig.MARKETING.description,
          "Add the audience, offer, CTA, tone, and exact output structure.",
        ],
        improvedPrompt:
          "Write a concise B2B SaaS launch email for operations leaders at mid-market companies. Use a confident but practical tone, include one clear CTA, keep it under 180 words, and format with subject line, preview text, and body.",
        versions: {
          create: [
            {
              label: "Original",
              promptText: "Write me a marketing email for our product.",
              versionType: PromptVersionType.ORIGINAL,
            },
            {
              label: "Quick improved",
              promptText:
                "Write a concise marketing email for operations leaders about our SaaS product. Include a clear subject line and one CTA.",
              versionType: PromptVersionType.QUICK_IMPROVED,
              notes: "Adds audience, structure, and CTA.",
            },
            {
              label: "Structured improved",
              promptText:
                "Create a B2B SaaS email for operations leaders. Format as subject line, preview text, and body. Keep the body under 180 words, use a practical professional tone, and end with one CTA.",
              versionType: PromptVersionType.STRUCTURED_IMPROVED,
              notes: "Defines format, tone, and length.",
            },
          ],
        },
      },
    });

    await prisma.usageEvent.create({
      data: {
        userId: demoUser.id,
        eventType: UsageEventType.PROMPT_EVALUATION,
        modelProvider: evaluation.modelProvider,
        modelId: evaluation.modelId,
        metadata: { seeded: true },
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
