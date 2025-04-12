import { SkeletonLoader } from "@/components/ui/skeleton-loader";

export default function Loading() {
  return (
    <div className="container px-4 py-12 md:px-6 md:py-20">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-2">
          <SkeletonLoader height="h-9" width="w-[180px]" />
          <SkeletonLoader height="h-5" width="w-[300px]" />
          <SkeletonLoader height="h-4" width="w-[400px]" />
        </div>

        <div className="border rounded-lg shadow-sm p-6 bg-card">
          <SkeletonLoader height="h-7" width="w-[170px]" />
          <div className="mt-6 flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
            <div className="space-y-4">
              <div className="space-y-2">
                <SkeletonLoader height="h-4" width="w-[80px]" />
                <SkeletonLoader height="h-6" width="w-[150px]" />
              </div>
              <div className="space-y-2">
                <SkeletonLoader height="h-4" width="w-[80px]" />
                <SkeletonLoader height="h-6" width="w-[200px]" />
              </div>
            </div>
          </div>
          <div className="mt-6">
            <SkeletonLoader height="h-10" width="w-[120px]" />
          </div>
        </div>

        <div className="border rounded-lg shadow-sm p-6 bg-card">
          <SkeletonLoader height="h-7" width="w-[200px]" />
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonLoader height="h-[120px]" />
            <SkeletonLoader height="h-[120px]" />
            <SkeletonLoader height="h-[120px]" />
          </div>
        </div>

        <div className="border rounded-lg shadow-sm p-6 bg-card">
          <SkeletonLoader height="h-7" width="w-[140px]" />
          <div className="mt-6 space-y-4">
            <SkeletonLoader height="h-12" />
            <SkeletonLoader height="h-12" />
            <SkeletonLoader height="h-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
