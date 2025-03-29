import { getServerSession } from "next-auth";
import MetaAdsQueries from "./MetaAdsQueries";
import SignInButton from "@/components/SignInButton";

export default async function MetaAdsPage() {
  const session = await getServerSession();
  if (!session) {
    return <SignInButton />;
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
