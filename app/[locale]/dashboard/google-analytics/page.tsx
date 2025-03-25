import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import GoogleAnalyticsQueries from "./GoogleAnalyticsQueries";

export default function GoogleAnalyticsPage() {
  const session = getServerSession();
  if (!session) {
    return redirect("api/auth/signin");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Google Analytics</h1>
        <p className="text-muted-foreground">
          Connect to your Google Analytics account to view your website
          analytics.
        </p>
      </div>
      <GoogleAnalyticsQueries />
    </div>
  );
}
