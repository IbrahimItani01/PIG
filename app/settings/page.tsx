import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { plans } from "@/config/plans";
import { modelConfigs } from "@/config/models";
import { requireUser } from "@/lib/auth/session";

export default async function SettingsPage() {
  const user = await requireUser();
  const plan = plans[user.plan];

  return (
    <AppShell role={user.role}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">Settings</h1>
          <p className="text-muted-foreground">Profile, preferred model, and plan usage.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Name:</span> {user.name ?? "Not set"}</div>
              <div><span className="text-muted-foreground">Email:</span> {user.email}</div>
              <div><span className="text-muted-foreground">Role:</span> <Badge variant="secondary">{user.role}</Badge></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Usage and plan</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Plan:</span> {plan.label}</div>
              <div><span className="text-muted-foreground">Monthly evaluations:</span> {plan.monthlyEvaluations}</div>
              <div><span className="text-muted-foreground">Monthly prompt tests:</span> {plan.monthlyPromptTests}</div>
              <div><span className="text-muted-foreground">Quality model runs:</span> {plan.monthlyQualityModelRuns}</div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Preferred model provider</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Select defaultValue={user.preferredProvider} disabled>
              <option value="default">Default</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="gemini">Gemini</option>
            </Select>
            <Select defaultValue={user.preferredModel} disabled>
              {Object.values(modelConfigs).map((model) => (
                <option key={model.id} value={model.id}>{model.displayName}</option>
              ))}
            </Select>
            <p className="text-sm text-muted-foreground md:col-span-2">Preference persistence is schema-ready. Enable editable settings once account management flows are finalized.</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
