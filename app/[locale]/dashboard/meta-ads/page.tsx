import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import MetaAdsQueries from "./MetaAdsQueries";

export default async function MetaAdsPage() {
  const session = await getServerSession();
  if (!session) {
    return redirect("../../api/auth/signin");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meta Ads</h1>
        <p className="text-muted-foreground">
          Connect to your Meta Ads account to view your campaign performance.
        </p>
      </div>
      <MetaAdsQueries />
    </div>
  );
}
