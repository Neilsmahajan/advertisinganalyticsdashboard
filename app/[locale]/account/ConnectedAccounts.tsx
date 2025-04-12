"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";

interface AccountConnection {
  id: string;
  service: string;
  accountName: string;
  accountId: string;
  connectedAt: string;
  status: "active" | "expired" | "pending";
}

export default function ConnectedAccounts() {
  const t = useTranslations("ConnectedAccounts");
  const [connections, setConnections] = useState<AccountConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConnections() {
      try {
        const res = await fetch("/api/account/connections");
        if (res.ok) {
          const data = await res.json();
          setConnections(data.connections);
        }
      } catch (error) {
        console.error("Error fetching connections:", error);
        toast({
          title: t("fetchErrorTitle") || "Error",
          description:
            t("fetchErrorDescription") || "Could not load account connections",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchConnections();
  }, [t]);

  const handleConnect = async (service: string) => {
    setConnecting(service);
    try {
      // Mock connecting to service - in a real app you would redirect to OAuth flow
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast({
        title: t("connectSuccessTitle"),
        description: t("connectSuccessDescription", { service }),
      });
      // After successful connection, you would add the new connection to the list
    } catch (error) {
      toast({
        title: t("connectErrorTitle"),
        description: t("connectErrorDescription", { service }),
        variant: "destructive",
      });
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (id: string, service: string) => {
    setDisconnecting(id);
    try {
      // Mock disconnecting from service
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: t("disconnectSuccessTitle"),
        description: t("disconnectSuccessDescription", { service }),
      });
      // After successful disconnection, filter out the removed connection
      setConnections((prevConnections) =>
        prevConnections.filter((connection) => connection.id !== id),
      );
    } catch (error) {
      toast({
        title: t("disconnectErrorTitle"),
        description: t("disconnectErrorDescription", { service }),
        variant: "destructive",
      });
    } finally {
      setDisconnecting(null);
    }
  };

  const connectionServices = [
    "Google Ads",
    "Google Analytics",
    "Meta Ads",
    "Microsoft Ads",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="border rounded-lg p-4 animate-pulse">
                <div className="flex justify-between mb-2">
                  <SkeletonLoader height="h-6" width="w-[150px]" />
                  <SkeletonLoader height="h-5" width="w-[70px]" circle />
                </div>
                <SkeletonLoader height="h-4" width="w-[200px]" />
                <div className="flex justify-between mt-4">
                  <SkeletonLoader height="h-4" width="w-[100px]" />
                  <SkeletonLoader height="h-8" width="w-[100px]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connectionServices.map((service) => {
              const connection = connections.find((c) => c.service === service);
              return (
                <div key={service} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{service}</h3>
                    {connection ? (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          connection.status === "active"
                            ? "bg-green-100 text-green-800"
                            : connection.status === "expired"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {connection.status}
                      </span>
                    ) : null}
                  </div>

                  {connection ? (
                    <>
                      <p className="text-sm text-muted-foreground mt-2">
                        {connection.accountName} ({connection.accountId})
                      </p>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-xs text-muted-foreground">
                          {t("connectedSince", {
                            date: new Date(
                              connection.connectedAt,
                            ).toLocaleDateString(),
                          })}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDisconnect(connection.id, connection.service)
                          }
                          disabled={disconnecting === connection.id}
                        >
                          {disconnecting === connection.id ? (
                            <div className="flex items-center">
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                              {t("disconnecting")}
                            </div>
                          ) : (
                            t("disconnect")
                          )}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="mt-4 flex justify-end">
                      <Button
                        onClick={() => handleConnect(service)}
                        disabled={connecting === service}
                      >
                        {connecting === service ? (
                          <div className="flex items-center">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                            {t("connecting")}
                          </div>
                        ) : (
                          t("connect")
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
