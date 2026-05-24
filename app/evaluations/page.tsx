import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { messages } from "@/config/messages";
import { requireUser } from "@/lib/auth/session";
import { toAppShellUser } from "@/lib/auth/app-shell-user";
import { getPrisma } from "@/lib/db/prisma";

export default async function EvaluationsPage() {
  const user = await requireUser();
  const evaluations = await getPrisma().promptEvaluation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <AppShell role={user.role} user={toAppShellUser(user)}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal">Evaluation history</h1>
            <p className="text-muted-foreground">Review saved prompt grades and rewrites.</p>
          </div>
          <Button asChild><Link href="/evaluations/new">New evaluation</Link></Button>
        </div>
        <Card>
          <CardHeader><CardTitle>Saved evaluations</CardTitle></CardHeader>
          <CardContent>
            {evaluations.length === 0 ? (
              <p className="text-sm text-muted-foreground">{messages.empty.evaluations}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Use case</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evaluations.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell><Link className="font-medium hover:text-accent" href={`/evaluations/${item.id}`}>{item.title}</Link></TableCell>
                      <TableCell><Badge variant="secondary">{item.useCase.replaceAll("_", " ").toLowerCase()}</Badge></TableCell>
                      <TableCell>{item.modelId}</TableCell>
                      <TableCell className="font-mono">{item.overallScore.toFixed(1)}</TableCell>
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
