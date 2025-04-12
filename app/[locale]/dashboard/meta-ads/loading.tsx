import { CardSkeleton, ChartSkeleton } from "@/components/ui/skeleton-loader";

export default function Loading() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <CardSkeleton />
      <ChartSkeleton />
    </div>
  );
}
