import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
  height?: string;
  width?: string;
  circle?: boolean;
  inline?: boolean;
}

export function SkeletonLoader({
  className,
  count = 1,
  height = "h-4",
  width = "w-full",
  circle = false,
  inline = false,
}: SkeletonLoaderProps) {
  const loaders = [];

  for (let i = 0; i < count; i++) {
    loaders.push(
      <div
        key={i}
        className={cn(
          "bg-muted animate-pulse rounded-md",
          height,
          width,
          circle && "rounded-full",
          inline ? "inline-block mr-2" : "block mb-3",
          className,
        )}
      />,
    );
  }

  return <>{loaders}</>;
}

export function CardSkeleton() {
  return (
    <div className="border rounded-lg p-6 shadow-sm bg-card animate-pulse">
      <div className="space-y-5">
        <SkeletonLoader height="h-7" width="w-3/4" />
        <SkeletonLoader height="h-4" width="w-1/2" />
        <div className="space-y-3 pt-3">
          <SkeletonLoader height="h-10" />
          <SkeletonLoader height="h-10" />
          <div className="grid grid-cols-2 gap-4">
            <SkeletonLoader height="h-10" />
            <SkeletonLoader height="h-10" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="border rounded-lg p-6 shadow-sm bg-card animate-pulse">
      <SkeletonLoader height="h-7" width="w-2/4" />
      <SkeletonLoader height="h-4" width="w-1/3" />
      <div className="mt-4 h-[300px] bg-muted rounded-md flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#47adbf] border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }) {
  return (
    <div className="flex items-center space-x-4 py-4">
      {Array(columns)
        .fill(0)
        .map((_, i) => (
          <SkeletonLoader
            key={i}
            height="h-5"
            width={i === 0 ? "w-[20%]" : "w-[80px]"}
            inline
          />
        ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between py-2">
        <SkeletonLoader height="h-8" width="w-[180px]" />
        <SkeletonLoader height="h-8" width="w-[120px]" />
      </div>
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted/50 p-4">
          <div className="flex space-x-4">
            {Array(columns)
              .fill(0)
              .map((_, i) => (
                <SkeletonLoader
                  key={i}
                  height="h-5"
                  width={i === 0 ? "w-[20%]" : "w-[80px]"}
                  inline
                />
              ))}
          </div>
        </div>
        <div className="bg-background p-4 divide-y">
          {Array(rows)
            .fill(0)
            .map((_, i) => (
              <TableRowSkeleton key={i} columns={columns} />
            ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <SkeletonLoader height="h-8" width="w-[260px]" />
        <SkeletonLoader height="h-4" width="w-[420px]" />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <CardSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}
