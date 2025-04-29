import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { BarChart3, Clock, Zap } from "lucide-react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "About Us | Advertising Analytics Dashboard",
  description:
    "Learn about our mission to simplify advertising analytics across multiple platforms and provide powerful insights for marketers.",
  keywords: [
    "advertising analytics team",
    "marketing dashboard company",
    "analytics platform",
    "data-driven advertising",
  ],
  openGraph: {
    title: "About Advertising Analytics Dashboard",
    description:
      "Our story, mission, and dedication to providing powerful advertising analytics solutions",
    type: "website",
    images: ["/cropped-advertising-analytics-dashboard-logo.png"],
  },
};

export default async function AboutPage() {
  const t = await getTranslations("About");
  return (
    <div className="container px-4 py-12 md:px-6 md:py-20">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            {t("pageTitle")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 md:text-lg">
            {t("introText")}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t("whatWeDoTitle")}</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{t("unifiedAnalyticsTitle")}</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {t("unifiedAnalyticsText")}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{t("realTimeInsightsTitle")}</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {t("realTimeInsightsText")}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{t("scalableSolutionsTitle")}</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {t("scalableSolutionsText")}
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t("whyChooseUsTitle")}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t("whyChooseUsText")}
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-500 dark:text-gray-400">
            <li>{t("chooseUsPoint1")}</li>
            <li>{t("chooseUsPoint2")}</li>
            <li>{t("chooseUsPoint3")}</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t("ourVisionTitle")}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t("ourVisionText")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button asChild>
            <Link href="/contact">{t("contactUs")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">{t("exploreServices")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
