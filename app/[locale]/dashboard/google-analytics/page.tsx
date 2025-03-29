import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import GoogleAnalyticsQueries from "./GoogleAnalyticsQueries";
import { getTranslations } from "next-intl/server";

export default async function GoogleAnalyticsPage() {
  const t = await getTranslations("GoogleAnalyticsPage");
  const session = await getServerSession();
  if (!session) {
    return redirect("../../api/auth/signin");
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
