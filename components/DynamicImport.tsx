"use client";
import React, { Suspense } from "react";
import { SkeletonLoader, ChartSkeleton } from "@/components/ui/skeleton-loader";

interface DynamicImportProps {
  importFn: () => Promise<any>;
  fallback?: React.ReactNode;
  props?: Record<string, any>;
}

export function DynamicImport({
  importFn,
  fallback = <ChartSkeleton />,
  props = {},
}: DynamicImportProps) {
  const LazyComponent = React.lazy(importFn);

  return (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

export function DynamicChart({
  importFn,
  props = {},
}: Omit<DynamicImportProps, "fallback">) {
  return (
    <DynamicImport
      importFn={importFn}
      fallback={
        <div className="border rounded-lg p-6">
          <SkeletonLoader height="h-7" width="w-2/4" />
          <SkeletonLoader height="h-4" width="w-1/3" />
          <div className="mt-4 h-[300px] bg-muted rounded-md flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#47adbf] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      }
      props={props}
    />
  );
}
