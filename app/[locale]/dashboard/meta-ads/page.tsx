import { auth } from "@/auth";
import MetaAdsQueries from "./MetaAdsQueries";
import { getTranslations } from "next-intl/server";
import SignInButton from "@/components/SignInButton";

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
