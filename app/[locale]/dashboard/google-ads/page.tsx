import { auth } from "@/auth";
import GoogleAdsQueries from "./GoogleAdsQueries";
import { getTranslations } from "next-intl/server";
import SignInButton from "@/components/SignInButton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Google Ads Analytics | Advertising Dashboard",
  description:
    "Track and analyze your Google Ads campaigns performance, metrics, and ROI in real-time.",
  keywords: [
    "Google Ads analytics",
    "PPC reporting",
    "Google Ads performance",
    "advertising ROI",
  ],
  openGraph: {
    title: "Google Ads Analytics Dashboard",
    description:
      "Comprehensive Google Ads campaign analytics and performance tracking",
    images: ["/google-ads-logo.png"],
  },
};

export default async function GoogleAdsPage() {
  const t = await getTranslations("GoogleAdsPage");
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
      <GoogleAdsQueries />
    </div>
  );
}
