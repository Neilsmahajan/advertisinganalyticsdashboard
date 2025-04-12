import React, { Suspense } from "react";
import DashboardSidebar from "./DashboardSidebar";
import { DashboardSkeleton } from "@/components/ui/skeleton-loader";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container grid flex-1 md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar />
      <main className="px-4 py-6 md:px-8 md:py-8">
        <ErrorBoundary>
          <Suspense fallback={<DashboardSkeleton />}>{children}</Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}
