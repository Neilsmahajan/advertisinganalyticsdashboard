"use client";

import { useSession, signIn } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Facebook, Laptop } from "lucide-react";

export default function ConnectedAccounts() {
  const { data: session } = useSession();
  const t = useTranslations("Account");
  const locale = useLocale();
  const [isDisconnecting, setIsDisconnecting] = useState<string | null>(null);

  const handleDisconnect = async (
    provider: "facebook" | "microsoft-entra-id",
  ) => {
    setIsDisconnecting(provider);
    try {
      const res = await fetch(`/api/auth/disconnect/${provider}`, {
        method: "POST",
      });
      if (res.ok) {
        toast({
          title:
            provider === "facebook"
              ? t("metaDisconnectSuccessTitle")
              : t("microsoftDisconnectSuccessTitle"),
          description:
            provider === "facebook"
              ? t("metaDisconnectSuccessDescription")
              : t("microsoftDisconnectSuccessDescription"),
        });
        // Reload to refresh the session
        window.location.reload();
      } else {
        toast({
          title:
            provider === "facebook"
              ? t("metaDisconnectErrorTitle")
              : t("microsoftDisconnectErrorTitle"),
          description:
            provider === "facebook"
              ? t("metaDisconnectErrorDescription")
              : t("microsoftDisconnectErrorDescription"),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title:
          provider === "facebook"
            ? t("metaDisconnectErrorTitle")
            : t("microsoftDisconnectErrorTitle"),
        description:
          provider === "facebook"
            ? t("metaDisconnectErrorDescription")
            : t("microsoftDisconnectErrorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsDisconnecting(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t("connectedAccounts")}</h2>
      <p className="text-gray-500 dark:text-gray-400">
        {t("connectedAccountsDescription")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Meta Account Card */}
        <Card className="shadow-lg rounded-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Facebook className="mr-2 h-5 w-5" /> {t("metaAccount")}
              </CardTitle>
            </div>
            <CardDescription>{t("metaAccountDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {session?.facebook?.accessToken
                      ? t("metaConnected")
                      : t("metaNotConnected")}
                  </p>
                </div>
                {session?.facebook?.accessToken ? (
                  <Button
                    variant="destructive"
                    onClick={() => handleDisconnect("facebook")}
                    disabled={isDisconnecting === "facebook"}
                  >
                    {isDisconnecting === "facebook"
                      ? t("disconnecting")
                      : t("disconnectMeta")}
                  </Button>
                ) : (
                  <Button
                    onClick={() =>
                      signIn("facebook", { callbackUrl: `/${locale}/account` })
                    }
                  >
                    {t("connectMeta")}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Microsoft Account Card */}
        <Card className="shadow-lg rounded-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Laptop className="mr-2 h-5 w-5" /> {t("microsoftAccount")}
              </CardTitle>
            </div>
            <CardDescription>
              {t("microsoftAccountDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {session?.microsoft?.accessToken
                      ? t("microsoftConnected")
                      : t("microsoftNotConnected")}
                  </p>
                </div>
                {session?.microsoft?.accessToken ? (
                  <Button
                    variant="destructive"
                    onClick={() => handleDisconnect("microsoft-entra-id")}
                    disabled={isDisconnecting === "microsoft-entra-id"}
                  >
                    {isDisconnecting === "microsoft-entra-id"
                      ? t("disconnecting")
                      : t("disconnectMicrosoft")}
                  </Button>
                ) : (
                  <Button
                    onClick={() =>
                      signIn("microsoft-entra-id", {
                        callbackUrl: `/${locale}/account`,
                      })
                    }
                  >
                    {t("connectMicrosoft")}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
