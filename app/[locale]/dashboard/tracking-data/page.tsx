import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import TrackingDataQueries from "./TrackingDataQueries";

export default async function TrackingDataPage() {
  const session = await getServerSession();
  if (!session) {
    return redirect("api/auth/signin");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Find Analytics and Tracking Data
        </h1>
        <p className="text-muted-foreground">
          Enter your website URL to find all of the Analytics and Tracking tags
          on your website.
        </p>
      </div>
      <TrackingDataQueries />
    </div>
  );
}
