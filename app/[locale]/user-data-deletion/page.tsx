"use client";
import React, { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { toast } from "@/components/ui/use-toast";

export default function UserDataDeletionPage() {
  const { data: session } = useSession();
  const t = useTranslations("UserDataDeletion");
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnectMeta = async () => {
    setIsDisconnecting(true);
    try {
      const res = await fetch("/api/auth/disconnect/meta", { method: "POST" });
      if (res.ok) {
        toast({
          title: t("disconnectSuccessTitle"),
          description: t("disconnectSuccessDescription"),
        });
      } else {
        toast({
          title: t("disconnectErrorTitle"),
          description: t("disconnectErrorDescription"),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t("disconnectErrorTitle"),
        description: t("disconnectErrorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{t("pageTitle")}</h1>
      <p className="mb-6">{t("introText")}</p>
      {/* {session?.meta?.accessToken ? (
        <Button onClick={handleDisconnectMeta} disabled={isDisconnecting}>
          {isDisconnecting ? t("disconnecting") : t("disconnectButton")}
        </Button>
      ) : (
        <Button onClick={() => signIn("meta")}>
          {t("connectButton")}
        </Button>
      )} */}
    </div>
  );
}
