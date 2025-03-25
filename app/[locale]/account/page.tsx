import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import SignOutButton from "./SignOutButton";
import { getServerSession } from "next-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart, BarChart3, LineChart, PieChart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AccountPage() {
  const session = await getServerSession();
  if (!session) {
    return redirect("api/auth/signin");
  }
  const t = await getTranslations("Account");
  return (
    <div className="container px-4 py-12 md:px-6 md:py-20">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            {t("myAccount")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 md:text-lg">
            {t("welcome", { name: session.user.name ?? "User" })}
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            {t("accountInfoDescription")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>{t("profileInformation")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("labelName")}
                </p>
                <p className="font-medium">{session.user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("labelEmail")}
                </p>
                <p className="font-medium">{session.user.email}</p>
              </div>
              <SignOutButton />
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{t("savedQueries")}</CardTitle>
              <CardDescription>{t("savedQueriesDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center">
                    <Search className="h-5 w-5 text-primary mr-2" />
                    <span>{t("trackingData")}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    {t("viewQuery")}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center">
                    <BarChart3 className="h-5 w-5 text-primary mr-2" />
                    <span>{t("googleAnalytics")}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    {t("viewQuery")}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center">
                    <LineChart className="h-5 w-5 text-primary mr-2" />
                    <span>{t("googleAds")}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    {t("viewQuery")}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center">
                    <PieChart className="h-5 w-5 text-primary mr-2" />
                    <span>{t("metaAds")}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    {t("viewQuery")}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center">
                    <BarChart className="h-5 w-5 text-primary mr-2" />
                    <span>{t("microsoftAds")}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    {t("viewQuery")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
