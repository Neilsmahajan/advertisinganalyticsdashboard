"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { usePathname } from "@/i18n/navigation";
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
import { useTranslations } from "next-intl";

export default function DashboardSidebar() {
  const t = useTranslations("DashboardSidebar");
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { data: session } = useSession();
  const routes = [
    {
      name: t("routeDashboard"),
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: t("routeTrackingData"),
      href: "/dashboard/tracking-data",
      icon: Search,
    },
    {
      name: t("routeGoogleAnalytics"),
      href: "/dashboard/google-analytics",
      icon: BarChart3,
    },
    {
      name: t("routeGoogleAds"),
      href: "/dashboard/google-ads",
      icon: LineChart,
    },
    {
      name: t("routeMetaAds"),
      href: "/dashboard/meta-ads",
      icon: PieChart,
    },
    {
      name: t("routeMicrosoftAds"),
      href: "/dashboard/microsoft-ads",
      icon: BarChart,
    },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/cropped-advertising-analytics-dashboard-logo.png"
            alt={t("logoAlt")}
            width={32}
            height={32}
            className="rounded-md"
          />
          <span className="font-bold text-sm">{t("logoText")}</span>
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
      <Link href="/account" onClick={() => setIsMobileOpen(false)}>
        <div className="mt-auto border-t p-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              {session?.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "User"}
                  width={32}
                  height={32}
                  className="rounded-full"
                  unoptimized
                />
              ) : (
                <span className="text-sm font-bold text-muted-foreground">
                  {session?.user.name?.[0] ?? ""}
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
      </Link>
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
              <span className="sr-only">{t("toggleSidebar")}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <div className="ml-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/cropped-advertising-analytics-dashboard-logo.png"
              alt={t("logoAlt")}
              width={24}
              height={24}
              className="rounded-md"
            />
            <span className="font-bold text-sm">{t("logoText")}</span>
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
