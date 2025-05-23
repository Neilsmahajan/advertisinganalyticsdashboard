import { DashboardSkeleton } from "@/components/ui/skeleton-loader";

export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      <DashboardSkeleton />
    </div>
  );
}
