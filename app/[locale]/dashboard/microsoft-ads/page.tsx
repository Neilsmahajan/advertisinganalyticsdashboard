import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import MicrosoftAdsQueries from "./MicrosoftAdsQueries";
import { getTranslations } from "next-intl/server";

export default async function MicrosoftAdsPage() {
  const t = await getTranslations("MicrosoftAdsPage");
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
      <MicrosoftAdsQueries />
    </div>
  );
}
