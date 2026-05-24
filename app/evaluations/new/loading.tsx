import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingNewEvaluation() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <Skeleton className="h-12 w-72" />
      <Skeleton className="h-[34rem] w-full" />
    </div>
  );
}
