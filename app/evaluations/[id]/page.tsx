import { notFound } from "next/navigation";
import { rubricConfig, type RubricKey, scoreInterpretations } from "@/config/rubric";
import { AppShell } from "@/components/layout/app-shell";
import { CopyButton } from "@/components/evaluation/copy-button";
import { TestPromptButton } from "@/components/evaluation/test-prompt-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireUser } from "@/lib/auth/session";
import { toAppShellUser } from "@/lib/auth/app-shell-user";
import { assertOwnsEvaluation } from "@/lib/auth/authorization";

const scoreFields: Array<[RubricKey, string]> = [
  ["clarity", "clarityScore"],
  ["context", "contextScore"],
  ["specificity", "specificityScore"],
  ["constraints", "constraintsScore"],
  ["outputFormat", "outputFormatScore"],
  ["examples", "examplesScore"],
  ["safety", "safetyScore"],
  ["testability", "testabilityScore"],
];

export default async function EvaluationResultPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const evaluation = await assertOwnsEvaluation(user.id, id);
  if (!evaluation) notFound();

  const interpretation = scoreInterpretations.find((item) => evaluation.overallScore >= item.min) ?? scoreInterpretations.at(-1);
  const weaknesses = Array.isArray(evaluation.weaknesses) ? (evaluation.weaknesses as string[]) : [];
  const recommendations = Array.isArray(evaluation.recommendations) ? (evaluation.recommendations as string[]) : [];

  return (
    <AppShell role={user.role} user={toAppShellUser(user)}>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal">{evaluation.title}</h1>
            <p className="text-muted-foreground">{evaluation.summary}</p>
          </div>
          <div className="rounded-lg border bg-card p-5 text-center">
            <div className="text-5xl font-semibold">{evaluation.overallScore.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">out of 10</div>
            <Badge className="mt-3" variant={evaluation.overallScore >= 7 ? "success" : "warning"}>{interpretation?.label}</Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {scoreFields.map(([key, field]) => {
            const value = evaluation[field as keyof typeof evaluation] as number;
            return (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="text-base">{rubricConfig[key].label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{rubricConfig[key].description}</span>
                    <span className="font-mono">{value}/10</span>
                  </div>
                  <Progress value={value * 10} />
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Weaknesses</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {weaknesses.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Recommendations</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {recommendations.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Original prompt</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <pre className="whitespace-pre-wrap rounded-md bg-secondary p-4 text-sm text-muted-foreground">{evaluation.originalPrompt}</pre>
            <CopyButton value={evaluation.originalPrompt} />
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {evaluation.versions.filter((version) => version.versionType !== "ORIGINAL").map((version) => (
            <Card key={version.id}>
              <CardHeader><CardTitle>{version.label}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <pre className="whitespace-pre-wrap rounded-md bg-secondary p-4 text-sm text-muted-foreground">{version.promptText}</pre>
                <CopyButton value={version.promptText} />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle>Save status</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Saved to your evaluation history on {evaluation.createdAt.toLocaleString()}.</p>
            <TestPromptButton evaluationId={evaluation.id} model={evaluation.modelId} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
