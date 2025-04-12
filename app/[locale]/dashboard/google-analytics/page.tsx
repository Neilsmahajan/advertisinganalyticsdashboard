import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import SignInButton from "@/components/SignInButton";
import GoogleAnalyticsQueries from "./GoogleAnalyticsQueries";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Google Analytics Dashboard | Advertising Analytics",
  description:
    "Visualize and analyze your website traffic data with comprehensive Google Analytics insights and reporting tools.",
  keywords: [
    "Google Analytics",
    "website analytics",
    "traffic analysis",
    "user behavior",
    "conversion tracking",
  ],
  openGraph: {
    title: "Google Analytics Dashboard",
    description:
      "In-depth analytics and reporting for your website traffic and user behavior",
    images: ["/google-analytics-logo.png"],
  },
};

export default async function GoogleAnalyticsPage() {
  const t = await getTranslations("GoogleAnalyticsPage");
  const session = await auth();
  if (!session) {
    return <SignInButton />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <GoogleAnalyticsQueries />
    </div>
  );
}
