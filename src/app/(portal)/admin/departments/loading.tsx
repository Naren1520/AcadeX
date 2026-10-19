import { SkeletonTable } from "@/components/feedback/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 h-7 w-48 animate-pulse rounded bg-neutral-200" />
      <SkeletonTable rows={6} cols={4} />
    </div>
  );
}
