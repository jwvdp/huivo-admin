import { Skeleton } from "@/components/ui/skeleton";

export function DepartmentTreeSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="rounded-lg border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-2 border-b px-4 py-2.5 last:border-0"
            style={{ paddingLeft: 12 + (i % 3) * 24 }}
          >
            <Skeleton className="size-4 shrink-0" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="size-8 shrink-0" />
            <Skeleton className="size-8 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
