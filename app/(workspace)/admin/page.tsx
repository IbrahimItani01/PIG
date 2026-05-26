"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { modelConfigs } from "@/config/models";
import { messages } from "@/config/messages";
import { useWorkspaceSnapshot } from "@/components/workspace/use-workspace";

export default function AdminPage() {
  const workspace = useWorkspaceSnapshot();
  if (!workspace) return null;

  const { user, adminUsageEvents } = workspace;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Admin/dev</h1>
        <p className="text-muted-foreground">Seed helpers, model configuration, and usage events.</p>
      </div>
      {user.role !== "ADMIN" ? (
        <Card>
          <CardContent className="pt-5 text-sm text-muted-foreground">Admin access required.</CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Seed data helper</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Run <code className="font-mono text-foreground">npm run seed</code> after migrations to add demo templates and a sample evaluation.
                </p>
                <p>Seed records are idempotent and keep editable product examples out of page components.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>AI model config overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.values(modelConfigs).map((model) => (
                  <div key={model.id} className="flex items-center justify-between rounded-md bg-secondary p-3 text-sm">
                    <span>{model.displayName}</span>
                    <Badge variant="secondary">{model.tier}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Usage events</CardTitle>
            </CardHeader>
            <CardContent>
              {adminUsageEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">{messages.empty.usage}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminUsageEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>{event.userEmail}</TableCell>
                        <TableCell>{event.eventType}</TableCell>
                        <TableCell>{event.modelId ?? "n/a"}</TableCell>
                        <TableCell>{new Date(event.createdAt).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
