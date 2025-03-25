import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import MicrosoftAdsQueries from "./MicrosoftAdsQueries";

export default async function MicrosoftAdsPage() {
  const session = await getServerSession();
  if (!session) {
    return redirect("api/auth/signin");
  }
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Microsoft Ads</h1>
        <p className="text-muted-foreground">
          Connect to your Microsoft Ads account to view your campaign
          performance.
        </p>
      </div>
      <MicrosoftAdsQueries />
    </div>
  );
}
