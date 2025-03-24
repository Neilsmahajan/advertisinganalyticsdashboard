import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  Users,
  BarChart3,
  LineChart,
  TrendingUp,
  Clock,
} from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async function DashboardPage() {
  const t = await getTranslations("Dashboard");
  const session = await getServerSession();
  console.log(session);
  if (!session) {
    return redirect("/api/auth/signin");
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
          <Button variant="outline" size="sm">
            <Clock className="mr-2 h-4 w-4" />
            {t("filterLast7Days")}
          </Button>
          <Button size="sm">
            <TrendingUp className="mr-2 h-4 w-4" />
            {t("viewReports")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalImpressions")}
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4M</div>
            <p className="text-xs text-muted-foreground">
              {t("impressionsChange")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalClicks")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48.2K</div>
            <p className="text-xs text-muted-foreground">{t("clicksChange")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("ctr")}</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{t("ctrValue")}</div>
            <p className="text-xs text-muted-foreground">{t("ctrChange")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("conversions")}
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{t("conversionsValue")}</div>
            <p className="text-xs text-muted-foreground">
              {t("conversionsChange")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t("performanceOverview")}</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full bg-muted/20 rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">
                {t("performanceChartPlaceholder")}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t("topCampaigns")}</CardTitle>
            <CardDescription>{t("campaignsDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-full">
                  <p className="text-sm font-medium">
                    {t("campaignSummerSale")}
                  </p>
                  <div className="h-2 w-full bg-muted mt-1 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: "75%" }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-medium">75%</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-full">
                  <p className="text-sm font-medium">
                    {t("campaignNewProductLaunch")}
                  </p>
                  <div className="h-2 w-full bg-muted mt-1 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: "63%" }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-medium">63%</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-full">
                  <p className="text-sm font-medium">
                    {t("campaignHolidaySpecial")}
                  </p>
                  <div className="h-2 w-full bg-muted mt-1 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: "52%" }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-medium">52%</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-full">
                  <p className="text-sm font-medium">
                    {t("campaignRetargeting")}
                  </p>
                  <div className="h-2 w-full bg-muted mt-1 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: "48%" }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-medium">48%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
