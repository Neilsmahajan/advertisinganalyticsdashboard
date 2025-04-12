import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import SignInButton from "@/components/SignInButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import DashboardQueries from "./DashboardQueries";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Advertising Analytics Dashboard",
  description:
    "View and manage all your advertising campaign analytics and performance metrics in one place.",
  openGraph: {
    title: "Your Advertising Analytics Dashboard",
    description:
      "Track, analyze, and optimize your advertising campaigns across multiple platforms",
    images: ["/cropped-advertising-analytics-dashboard-logo.png"],
  },
};

export default async function DashboardPage() {
  const t = await getTranslations("Dashboard");
  const session = await auth();

  if (!session) {
    return <SignInButton />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("pageTitle")}
          </h1>
          <p className="text-muted-foreground">{t("welcomeText")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/dashboard/tracking-data">
              <Plus className="mr-2 h-4 w-4" />
              {t("newQuery")}
            </Link>
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("savedQueriesTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <DashboardQueries />
        </CardContent>
      </Card>
    </div>
  );
}
