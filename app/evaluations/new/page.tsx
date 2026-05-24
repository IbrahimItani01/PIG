import { EvaluationForm } from "@/components/evaluation/evaluation-form";
import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth/session";
import { toAppShellUser } from "@/lib/auth/app-shell-user";
import { getAllowedModels } from "@/lib/ai/model-registry";

export default async function NewEvaluationPage() {
  const user = await requireUser();
  const models = getAllowedModels(user.plan);
  const preferredIndex = models.findIndex((model) => model.id === user.preferredModel);
  const orderedModels = preferredIndex > 0
    ? [models[preferredIndex], ...models.slice(0, preferredIndex), ...models.slice(preferredIndex + 1)]
    : models;

  return (
    <AppShell role={user.role} user={toAppShellUser(user)}>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">Grade a prompt</h1>
          <p className="text-muted-foreground">Evaluate prompt quality and generate stronger versions.</p>
        </div>
        <EvaluationForm models={orderedModels} />
      </div>
    </AppShell>
  );
}
