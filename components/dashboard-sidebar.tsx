"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Search,
  BarChart3,
  LineChart,
  PieChart,
  BarChart,
  ChevronRight,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSession } from "next-auth/react";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { data: session } = useSession();
  const routes = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Tracking Data",
      href: "/dashboard/tracking-data",
      icon: Search,
    },
    {
      name: "Google Analytics",
      href: "/dashboard/google-analytics",
      icon: BarChart3,
    },
    {
      name: "Google Ads",
      href: "/dashboard/google-ads",
      icon: LineChart,
    },
    {
      name: "Meta Ads",
      href: "/dashboard/meta-ads",
      icon: PieChart,
    },
    {
      name: "Microsoft Ads",
      href: "/dashboard/microsoft-ads",
      icon: BarChart,
    },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cropped-advertising-analytics-dashboard-logo-Yg1JRKxaA3ZMzwMaRVYnv8HDKk2Vcb.png"
            alt="Advertising Analytics Dashboard Logo"
            width={32}
            height={32}
            className="rounded-md"
          />
          <span className="font-bold text-sm">
            Advertising Analytics Dashboard
          </span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                pathname === route.href
                  ? "bg-muted font-medium text-primary"
                  : "text-muted-foreground",
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.name}
              {pathname === route.href && (
                <ChevronRight className="ml-auto h-4 w-4" />
              )}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            {session?.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <span className="text-sm font-bold text-muted-foreground">
                {session?.user.name[0]}
              </span>
            )}
          </div>
          <div>
            <p className="text-xs font-medium">{session?.user.name}</p>
            <p className="text-xs text-muted-foreground">
              {session?.user.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="flex h-14 items-center border-b px-4 md:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <div className="ml-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cropped-advertising-analytics-dashboard-logo-Yg1JRKxaA3ZMzwMaRVYnv8HDKk2Vcb.png"
              alt="Advertising Analytics Dashboard Logo"
              width={24}
              height={24}
              className="rounded-md"
            />
            <span className="font-bold text-sm">Advertising Analytics Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/10 md:block md:w-64">
        <SidebarContent />
      </div>
    </>
  );
}
