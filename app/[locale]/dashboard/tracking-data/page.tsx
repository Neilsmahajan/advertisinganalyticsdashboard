import { auth } from "@/auth";
import { redirect } from "next/navigation";
import TrackingDataQueries from "./TrackingDataQueries";
import { getTranslations } from "next-intl/server";
import SignInButton from "@/components/SignInButton";

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
