import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingEvaluationResult() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between gap-4">
        <Skeleton className="h-20 w-full max-w-2xl" />
        <Skeleton className="h-28 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
      <Skeleton className="h-72 w-full" />
    </div>
  );
}
