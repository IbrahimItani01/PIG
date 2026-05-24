import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingSettings() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-12 w-72" />
      <Skeleton className="h-56 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
