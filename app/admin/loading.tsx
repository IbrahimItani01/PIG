import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingAdmin() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-12 w-72" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
