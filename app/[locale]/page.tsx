import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Play,
  Search,
  BarChart3,
  LineChart,
  PieChart,
  LayoutDashboard,
  Clock,
  Users,
} from "lucide-react";
import SignInButton from "../../components/SignInButton";
import { useTranslations } from "next-intl";
import { Metadata } from "next";
import { FaqJsonLd, SoftwareApplicationJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title:
    "Advertising Analytics Dashboard | All-in-One Marketing Analytics Platform",
  description:
    "Track, analyze, and optimize your advertising campaigns across Google, Meta, Microsoft and more - all in one unified dashboard.",
  keywords: [
    "advertising analytics",
    "marketing dashboard",
    "ad campaign tracking",
    "cross-platform analytics",
    "Google Ads dashboard",
    "Meta Ads analytics",
    "Microsoft Ads reporting",
    "marketing ROI",
    "advertising performance",
  ],
  openGraph: {
    title: "Advertising Analytics Dashboard | Unified Marketing Analytics",
    description:
      "Track and analyze all your advertising campaigns in one central dashboard. Get real-time insights across Google, Meta, Microsoft and more.",
    type: "website",
    images: [
      {
        url: "/cropped-advertising-analytics-dashboard-logo.png",
        width: 1200,
        height: 630,
        alt: "Advertising Analytics Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Advertising Analytics Dashboard",
    description:
      "Unified marketing analytics platform for all your advertising campaigns",
    images: ["/cropped-advertising-analytics-dashboard-logo.png"],
  },
};

export default function Home() {
  const t = useTranslations("Home");
  return (
    <>
      <FaqJsonLd />
      <SoftwareApplicationJsonLd />
      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  {t("advertisingAnalyticsDashboard")}
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  {t("manageAndAnalyze")}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg">
                  <Link href="/dashboard">
                    {t("exploreServices")}{" "}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg">
                  <Play className="mr-2 h-4 w-4" /> {t("watchVideo")}
                </Button>
                <SignInButton />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {t("keyFeatures")}
                </h2>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  {t("whyUseThisTool")}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
                <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg shadow-sm">
                  <Search className="h-12 w-12 text-primary" />
                  <h3 className="text-xl font-bold">
                    {t("trackingDataTitle")}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {t("trackingDataDescription")}
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg shadow-sm">
                  <LayoutDashboard className="h-12 w-12 text-primary" />
                  <h3 className="text-xl font-bold">
                    {t("unifiedDashboardTitle")}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {t("unifiedDashboardDescription")}
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg shadow-sm">
                  <Clock className="h-12 w-12 text-primary" />
                  <h3 className="text-xl font-bold">
                    {t("realTimeDataTitle")}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {t("realTimeDataDescription")}
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg shadow-sm">
                  <Users className="h-12 w-12 text-primary" />
                  <h3 className="text-xl font-bold">
                    {t("multipleAccountsTitle")}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {t("multipleAccountsDescription")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platforms Section */}
        <section className="py-20 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {t("supportedPlatformsTitle")}
                </h2>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  {t("supportedPlatformsDescription")}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mt-8">
                <Link href="/dashboard/tracking-data">
                  <div className="flex flex-col items-center space-y-2 p-6">
                    <Search className="h-16 w-16 text-primary" />
                    <h3 className="text-lg font-medium">
                      {t("trackingDataTitle")}
                    </h3>
                  </div>
                </Link>
                <Link href="/dashboard/google-analytics">
                  <div className="flex flex-col items-center space-y-2 p-6">
                    <BarChart3 className="h-16 w-16 text-primary" />
                    <h3 className="text-lg font-medium">
                      {t("googleAnalyticsTitle")}
                    </h3>
                  </div>
                </Link>
                <Link href="/dashboard/google-ads">
                  <div className="flex flex-col items-center space-y-2 p-6">
                    <LineChart className="h-16 w-16 text-primary" />
                    <h3 className="text-lg font-medium">
                      {t("googleAdsTitle")}
                    </h3>
                  </div>
                </Link>
                <Link href="/dashboard/meta-ads">
                  <div className="flex flex-col items-center space-y-2 p-6">
                    <PieChart className="h-16 w-16 text-primary" />
                    <h3 className="text-lg font-medium">{t("metaAdsTitle")}</h3>
                  </div>
                </Link>
                <Link href="/dashboard/microsoft-ads">
                  <div className="flex flex-col items-center space-y-2 p-6">
                    <BarChart3 className="h-16 w-16 text-primary" />
                    <h3 className="text-lg font-medium">
                      {t("microsoftAdsTitle")}
                    </h3>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {t("ctaTitle")}
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/dashboard">
                    {t("exploreServices")}{" "}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <SignInButton />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
