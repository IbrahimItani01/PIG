"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { ResolvedModel } from "@/lib/ai/model-registry";
import type { LogicalModelId } from "@/config/models";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { messages } from "@/config/messages";
import { outputFormats, toneOptions, useCaseConfig } from "@/config/use-cases";
import { detectSecrets } from "@/lib/utils/secrets";

export function EvaluationForm({ models }: { models: ResolvedModel[] }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [useCase, setUseCase] = useState("GENERAL");
  const [targetAudience, setTargetAudience] = useState("");
  const [desiredOutput, setDesiredOutput] = useState<string>(outputFormats[0]);
  const [tone, setTone] = useState<string>(toneOptions[0]);
  const [model, setModel] = useState<LogicalModelId>(models[0]?.id ?? "default-fast");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const detectedSecrets = useMemo(() => detectSecrets(prompt), [prompt]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (detectedSecrets.length > 0) {
      setError(messages.errors.secretsDetected);
      return;
    }

    setLoading(true);
    const response = await fetch("/api/evaluations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt, useCase, targetAudience, desiredOutput, tone, model }),
    });
    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? messages.errors.generic);
      return;
    }

    router.push(`/evaluations/${payload.evaluation.id}`);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New evaluation</CardTitle>
        <CardDescription>{messages.warnings.sensitiveData}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea id="prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Paste the prompt you want to evaluate..." required maxLength={12000} className="min-h-64" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{prompt.length.toLocaleString()} / 12,000 characters</span>
              {detectedSecrets.length > 0 ? <span className="text-destructive">Possible secret detected</span> : null}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="useCase">Use case</Label>
              <Select id="useCase" value={useCase} onChange={(event) => setUseCase(event.target.value)}>
                {Object.entries(useCaseConfig).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="audience">Target audience</Label>
              <Input id="audience" value={targetAudience} onChange={(event) => setTargetAudience(event.target.value)} placeholder="e.g. senior backend engineers" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="output">Desired output</Label>
              <Input id="output" list="output-formats" value={desiredOutput} onChange={(event) => setDesiredOutput(event.target.value)} required />
              <datalist id="output-formats">
                {outputFormats.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select id="tone" value={tone} onChange={(event) => setTone(event.target.value)}>
                {toneOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="model">Model</Label>
              <Select id="model" value={model} onChange={(event) => setModel(event.target.value as LogicalModelId)}>
                {models.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.displayName} · {item.provider}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button disabled={loading || prompt.length < 20}>{loading ? "Evaluating" : "Evaluate prompt"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
