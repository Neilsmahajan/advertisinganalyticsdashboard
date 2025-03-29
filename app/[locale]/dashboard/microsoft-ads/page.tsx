import { getServerSession } from "next-auth";
import MicrosoftAdsQueries from "./MicrosoftAdsQueries";
import { getTranslations } from "next-intl/server";
import SignInButton from "@/components/SignInButton";

export default async function MicrosoftAdsPage() {
  const t = await getTranslations("MicrosoftAdsPage");
  const session = await getServerSession();
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
