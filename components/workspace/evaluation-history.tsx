"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { workspaceConfig } from "@/config/workspace";
import { messages } from "@/config/messages";
import type { EvaluationPagination } from "@/lib/workspace/evaluation-history";
import type { WorkspaceEvaluationSummary } from "@/lib/store/workspace-slice";

export function EvaluationHistory({
  initialEvaluations,
  initialPagination,
}: {
  initialEvaluations: WorkspaceEvaluationSummary[];
  initialPagination: EvaluationPagination;
}) {
  const [evaluations, setEvaluations] = useState<WorkspaceEvaluationSummary[]>(initialEvaluations);
  const [pagination, setPagination] = useState<EvaluationPagination>(initialPagination);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadPage(page: number) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/evaluations?page=${page}&pageSize=${workspaceConfig.evaluationHistoryPageSize}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Evaluation history could not be loaded.");
      setEvaluations(payload.evaluations);
      setPagination(payload.pagination);
    } catch (historyError) {
      setError(historyError instanceof Error ? historyError.message : "Evaluation history could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>Saved evaluations</span>
          <span className="text-sm font-normal text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
        {evaluations.length === 0 && !loading ? (
          <p className="text-sm text-muted-foreground">{messages.empty.evaluations}</p>
        ) : (
          <div className="space-y-4">
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
                    <TableCell>
                      <Link className="font-medium hover:text-accent" href={`/evaluations/${item.id}`}>
                        {item.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.useCase.replaceAll("_", " ").toLowerCase()}</Badge>
                    </TableCell>
                    <TableCell>{item.modelId}</TableCell>
                    <TableCell className="font-mono">{item.overallScore.toFixed(1)}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {loading ? "Loading history..." : `${pagination.total.toLocaleString()} saved evaluations`}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" disabled={loading || !pagination.hasPreviousPage} onClick={() => loadPage(pagination.page - 1)}>
                  Previous
                </Button>
                <Button variant="outline" disabled={loading || !pagination.hasNextPage} onClick={() => loadPage(pagination.page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
