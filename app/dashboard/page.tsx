import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { UserAvatar } from "@/components/account/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { dashboardCards } from "@/config/dashboard";
import { messages } from "@/config/messages";
import { requireUser } from "@/lib/auth/session";
import { toAppShellUser } from "@/lib/auth/app-shell-user";
import { getBillingUsageSummary } from "@/lib/billing/usage";
import { getPrisma } from "@/lib/db/prisma";

export default async function DashboardPage() {
  const user = await requireUser();
  const prisma = getPrisma();
  const evaluations = await prisma.promptEvaluation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  const aggregate = await prisma.promptEvaluation.aggregate({
    where: { userId: user.id },
    _count: true,
    _avg: { overallScore: true },
    _max: { overallScore: true },
  });

  const usage = await getBillingUsageSummary(user.id, user.plan);
  const stats = {
    totalEvaluations: aggregate._count,
    averageScore: aggregate._avg.overallScore ? aggregate._avg.overallScore.toFixed(1) : "0.0",
    bestScore: aggregate._max.overallScore ? aggregate._max.overallScore.toFixed(1) : "0.0",
    remainingCredits: usage.evaluations.remaining,
  };

  return (
    <AppShell role={user.role} user={toAppShellUser(user)}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <UserAvatar name={user.name} email={user.email} imageUrl={user.avatarUrl} size="lg" />
            <div>
              <h1 className="text-3xl font-semibold tracking-normal">Dashboard</h1>
              <p className="text-muted-foreground">Prompt quality, usage, and recent evaluations.</p>
            </div>
          </div>
          <Button asChild>
            <Link href="/evaluations/new"><PlusCircle className="h-4 w-4" />New evaluation</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboardCards.map((card) => (
            <Card key={card.key}>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">{card.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{stats[card.key]}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Recent evaluations</CardTitle>
          </CardHeader>
          <CardContent>
            {evaluations.length === 0 ? (
              <p className="text-sm text-muted-foreground">{messages.empty.evaluations}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prompt</TableHead>
                    <TableHead>Use case</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evaluations.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell><Link href={`/evaluations/${item.id}`} className="font-medium hover:text-accent">{item.title}</Link></TableCell>
                      <TableCell><Badge variant="secondary">{item.useCase.replaceAll("_", " ").toLowerCase()}</Badge></TableCell>
                      <TableCell className="font-mono">{item.overallScore.toFixed(1)}/10</TableCell>
                      <TableCell className="text-muted-foreground">{item.createdAt.toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
