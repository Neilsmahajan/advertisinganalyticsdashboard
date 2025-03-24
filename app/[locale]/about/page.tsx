import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { BarChart3, Clock, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AboutPage() {
  const t = useTranslations("About");
  return (
    <div className="container px-4 py-12 md:px-6 md:py-20">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            {t("aboutTitle")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 md:text-lg">
            {t("mission")}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t("whatWeDoHeader")}</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{t("unifiedAnalyticsTitle")}</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {t("unifiedAnalyticsDescription")}
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
                  {t("realTimeInsightsDescription")}
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
                  {t("scalableSolutionsDescription")}
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t("whyChooseUsHeader")}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t("whyChooseUsIntro")}
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-500 dark:text-gray-400">
            <li>{t("whyChooseUsItem1")}</li>
            <li>{t("whyChooseUsItem2")}</li>
            <li>{t("whyChooseUsItem3")}</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t("ourVisionHeader")}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t("ourVisionDescription")}
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
