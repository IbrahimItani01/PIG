"use client";

import { CalendarClock, CheckCircle2, CreditCard, Gauge, TestTube2, Zap } from "lucide-react";
import { CheckoutButton, PortalButton } from "@/components/billing/billing-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { plans } from "@/config/plans";
import { useWorkspaceSnapshot } from "@/components/workspace/use-workspace";

const metricCards = [
  { key: "evaluations", label: "Evaluations", icon: Gauge },
  { key: "promptTests", label: "Prompt tests", icon: TestTube2 },
  { key: "qualityModelRuns", label: "Quality model runs", icon: Zap },
] as const;

export default function BillingPage() {
  const workspace = useWorkspaceSnapshot();
  if (!workspace) return null;

  const { usage, user } = workspace;
  const plan = plans[user.plan];
  const subscription = usage.subscription;
  const canOpenPortal = usage.canOpenPortal;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">Billing</h1>
          <p className="text-muted-foreground">Plan, subscription status, monthly usage, and invoices.</p>
        </div>
        <PortalButton disabled={!canOpenPortal} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current plan
            </CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm md:grid-cols-2">
            <Detail label="Plan" value={`${plan.label} ${plan.price}/mo`} />
            <Detail label="Status" value={subscription?.status.toLowerCase().replaceAll("_", " ") ?? "free"} />
            <Detail label="Billing period" value={`${formatDate(usage.period.start)} - ${formatDate(usage.period.end)}`} />
            <Detail label="Renews" value={subscription?.cancelAtPeriodEnd ? "Cancels at period end" : formatDate(usage.period.end)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" />
              Monthly reset
            </CardTitle>
            <CardDescription>Limits are enforced until this period ends.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="text-2xl font-semibold">{daysUntil(usage.period.end)} days</div>
            <p className="text-muted-foreground">
              Usage resets on {formatDate(usage.period.end)}. Paid subscriptions use Stripe billing periods; free accounts use the calendar month.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {metricCards.map((item) => {
          const metric = usage[item.key];
          const Icon = item.icon;
          return (
            <Card key={item.key}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  <Badge variant={metric.remaining > 0 ? "secondary" : "danger"}>{metric.remaining} left</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-semibold">
                  {metric.used.toLocaleString()} / {metric.limit.toLocaleString()}
                </div>
                <Progress value={metric.percent} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Object.values(plans).map((item) => {
          const current = item.name === user.plan;
          return (
            <Card key={item.name} className={current ? "border-primary" : undefined}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>{item.label}</CardTitle>
                  {current ? <Badge>Current</Badge> : null}
                </div>
                <CardDescription className="space-y-2">
                  <span className="block">
                    <span className="text-3xl font-semibold text-foreground">{item.price}</span> / month
                  </span>
                  <span className="block">{item.description}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {item.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <CheckoutButton plan={item.name} variant={item.name === "PREMIUM" ? "default" : "outline"} disabled={current}>
                  {current ? "Current plan" : item.cta}
                </CheckoutButton>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing management</CardTitle>
          <CardDescription>Use Stripe Customer Portal for invoices, payment methods, cancellation, and subscription changes.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>{canOpenPortal ? "Use the portal for invoices, payment methods, and cancellation." : "Choose a plan to create your Stripe billing profile."}</span>
          <PortalButton disabled={!canOpenPortal} />
        </CardContent>
      </Card>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}

function daysUntil(date: string) {
  const diff = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}
