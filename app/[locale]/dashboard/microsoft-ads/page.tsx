import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import SignInButton from "@/components/SignInButton";
import MicrosoftAdsQueries from "./MicrosoftAdsQueries";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Microsoft Ads Analytics | Advertising Dashboard",
  description:
    "Monitor and optimize your Microsoft Advertising campaigns with detailed performance metrics and insights.",
  keywords: [
    "Microsoft Ads analytics",
    "Bing advertising",
    "Microsoft PPC",
    "Microsoft Advertising dashboard",
  ],
  openGraph: {
    title: "Microsoft Ads Analytics Dashboard",
    description:
      "Comprehensive analytics for your Microsoft Advertising campaigns",
    images: ["/microsoft-ads-logo.png"],
  },
};

export default async function MicrosoftAdsPage() {
  const t = await getTranslations("MicrosoftAdsPage");
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
      <MicrosoftAdsQueries />
    </div>
  );
}
