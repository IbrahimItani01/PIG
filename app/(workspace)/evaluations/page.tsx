import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EvaluationHistory } from "@/components/workspace/evaluation-history";
import { requireUser } from "@/lib/auth/session";
import { getEvaluationHistoryPage } from "@/lib/workspace/evaluation-history";

export default async function EvaluationsPage() {
  const user = await requireUser();
  const history = await getEvaluationHistoryPage({ userId: user.id });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">Evaluation history</h1>
          <p className="text-muted-foreground">Review saved prompt grades and rewrites.</p>
        </div>
        <Button asChild>
          <Link href="/evaluations/new">New evaluation</Link>
        </Button>
      </div>
      <EvaluationHistory initialEvaluations={history.evaluations} initialPagination={history.pagination} />
    </div>
  );
}
