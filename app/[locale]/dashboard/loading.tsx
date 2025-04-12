import { DashboardSkeleton } from "@/components/ui/skeleton-loader";

export default function Loading() {
  return (
    <div className="container mx-auto py-8">
      <DashboardSkeleton />
    </div>
  );
}
