import { SkeletonTable } from "@/components/feedback/Skeleton";
export default function Loading() {
  return <div className="mx-auto max-w-7xl px-4 py-6"><SkeletonTable rows={4} cols={5} /></div>;
}
