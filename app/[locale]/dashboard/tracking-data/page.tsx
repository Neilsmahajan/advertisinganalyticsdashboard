import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import SignInButton from "@/components/SignInButton";
import TrackingDataQueries from "./TrackingDataQueries";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tracking Data Analytics | Advertising Dashboard",
  description:
    "Monitor your pixel tracking, conversion events, and custom tracking data across all marketing campaigns.",
  keywords: [
    "tracking pixels",
    "conversion tracking",
    "event analytics",
    "tag management",
    "marketing attribution",
  ],
  openGraph: {
    title: "Tracking Data Analytics Dashboard",
    description:
      "Comprehensive analytics for your tracking pixels and conversion events",
    images: ["/tracking-data-logo.png"],
  },
};

export default async function TrackingDataPage() {
  const t = await getTranslations("TrackingDataPage");
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
      <TrackingDataQueries />
    </div>
  );
}
