import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import GoogleAdsQueries from "./GoogleAdsQueries";

export default async function GoogleAdsPage() {
  const session = await getServerSession();
  if (!session) {
    return redirect("api/auth/signin");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Google Ads</h1>
        <p className="text-muted-foreground">
          Connect to your Google Ads account to view your campaign performance.
        </p>
      </div>
      <GoogleAdsQueries />
    </div>
  );
}
