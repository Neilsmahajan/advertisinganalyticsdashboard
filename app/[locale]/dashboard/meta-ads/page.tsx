import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import SignInButton from "@/components/SignInButton";
import MetaAdsQueries from "./MetaAdsQueries";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meta Ads Analytics | Advertising Dashboard",
  description:
    "Analyze Facebook and Instagram ad performance with comprehensive Meta Ads metrics and insights.",
  keywords: [
    "Meta Ads analytics",
    "Facebook ads",
    "Instagram ads",
    "social media advertising",
    "Meta performance",
  ],
  openGraph: {
    title: "Meta Ads Analytics Dashboard",
    description:
      "Track and optimize your Facebook and Instagram advertising campaigns",
    images: ["/meta-ads-logo.png"],
  },
};

export default async function MetaAdsPage() {
  const t = await getTranslations("MetaAdsPage");
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
      <MetaAdsQueries />
    </div>
  );
}
