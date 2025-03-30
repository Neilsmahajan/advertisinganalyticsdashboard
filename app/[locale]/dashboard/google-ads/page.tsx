import { auth } from "@/auth";
import GoogleAdsQueries from "./GoogleAdsQueries";
import { getTranslations } from "next-intl/server";
import SignInButton from "@/components/SignInButton";

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
