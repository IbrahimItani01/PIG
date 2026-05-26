"use client";

import { EvaluationForm } from "@/components/evaluation/evaluation-form";
import { useWorkspaceSnapshot } from "@/components/workspace/use-workspace";

export default function NewEvaluationPage() {
  const workspace = useWorkspaceSnapshot();
  if (!workspace) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Grade a prompt</h1>
        <p className="text-muted-foreground">Evaluate prompt quality and generate stronger versions.</p>
      </div>
      <EvaluationForm models={workspace.models} />
    </div>
  );
}
