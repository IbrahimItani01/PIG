"use client";

import { AccountSettingsForm } from "@/components/account/account-settings-form";
import { UserAvatar } from "@/components/account/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { plans } from "@/config/plans";
import { useWorkspaceSnapshot } from "@/components/workspace/use-workspace";

export default function SettingsPage() {
  const workspace = useWorkspaceSnapshot();
  if (!workspace) return null;

  const { user, models } = workspace;
  const plan = plans[user.plan];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Settings</h1>
        <p className="text-muted-foreground">Account, sign-in methods, preferred model, and plan usage.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account identity</CardTitle>
            <CardDescription>Your application profile and Supabase auth state.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-4">
              <UserAvatar name={user.name} email={user.email} imageUrl={user.avatarUrl} size="xl" />
              <div className="min-w-0">
                <div className="truncate text-lg font-semibold">{user.name ?? "Unnamed account"}</div>
                <div className="truncate text-muted-foreground">{user.email}</div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-muted-foreground">Auth provider:</span> <Badge variant="secondary">{user.authProvider}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Email confirmed:</span> {user.emailConfirmedAt ? "Yes" : "Pending"}
              </div>
              <div>
                <span className="text-muted-foreground">Last sign-in:</span>{" "}
                {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString() : "Not available"}
              </div>
              <div>
                <span className="text-muted-foreground">Role:</span> <Badge variant="secondary">{user.role}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Usage and plan</CardTitle>
            <CardDescription>Plan limits are enforced monthly, with daily abuse throttles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Plan:</span> {plan.label}
            </div>
            <div>
              <span className="text-muted-foreground">Monthly evaluations:</span> {plan.monthlyEvaluations}
            </div>
            <div>
              <span className="text-muted-foreground">Monthly prompt tests:</span> {plan.monthlyPromptTests}
            </div>
            <div>
              <span className="text-muted-foreground">Quality model runs:</span> {plan.monthlyQualityModelRuns}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Account management</CardTitle>
          <CardDescription>Update your profile, choose the default model for new work, or end this session.</CardDescription>
        </CardHeader>
        <CardContent>
          <AccountSettingsForm
            user={{
              email: user.email,
              name: user.name,
              plan: user.plan,
              preferredModel: user.preferredModel,
            }}
            models={models}
          />
        </CardContent>
      </Card>
    </div>
  );
}
