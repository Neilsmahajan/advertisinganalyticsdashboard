import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import SignOutButton from "./SignOutButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AccountQueries from "./AccountQueries";
import SignInButton from "@/components/SignInButton";
import { ProfileImage } from "@/components/ProfileImage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Account | Advertising Analytics Dashboard",
  description:
    "Manage your account settings, preferences, and advertising platform integrations.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Account Management | Advertising Analytics Dashboard",
    description:
      "Securely manage your account settings and advertising platform connections",
  },
};

export default async function AccountPage() {
  const session = await auth();
  if (!session) {
    return <SignInButton />;
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

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <Card className="md:col-span-1 shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle>{t("profileInformation")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <ProfileImage
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  size={64}
                  fallbackText={session.user.name?.[0]}
                />
                <div className="grid grid-cols-1 gap-y-2">
                  <div>
                    <p className="text-sm text-gray-500">{t("labelName")}</p>
                    <p className="font-medium text-lg">{session.user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t("labelEmail")}</p>
                    <p className="font-medium text-lg">{session.user.email}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <SignOutButton />
              </div>
            </CardContent>
          </Card>
        </div>

        <AccountQueries />
      </div>
    </div>
  );
}
