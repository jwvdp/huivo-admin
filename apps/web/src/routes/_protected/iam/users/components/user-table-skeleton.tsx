import { Skeleton } from "@/components/ui/skeleton";

export function UserTableSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
      <div className="rounded-lg border">
        <div className="flex gap-4 border-b px-4 py-3">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-10" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 border-b px-4 py-4 last:border-0"
          >
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="size-8 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
