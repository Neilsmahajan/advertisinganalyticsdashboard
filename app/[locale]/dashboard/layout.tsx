import type { ReactNode } from "react";
import DashboardSidebar from "@/app/[locale]/dashboard/DashboardSidebar";
import { redirect } from "next/navigation";

// This is a mock authentication check
// In a real application, you would check if the user is authenticated
const isAuthenticated = () => {
  // For demo purposes, we'll assume the user is authenticated
  return true;
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  // Check if user is authenticated
  if (!isAuthenticated()) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <DashboardSidebar />
      <div className="flex-1 p-4 md:p-8">{children}</div>
    </div>
  );
}
