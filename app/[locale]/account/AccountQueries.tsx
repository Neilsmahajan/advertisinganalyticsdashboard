"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { redirect } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";

interface Query {
  id: string;
  queryName: string;
  createdAt?: string;
}

interface ServiceQueries {
  [service: string]: Query[];
}

const services = [
  "Tracking Data",
  "Google Analytics",
  "Google Ads",
  "Meta Ads",
  "Microsoft Ads",
];

export default function AccountQueries() {
  const t = useTranslations("AccountQueries");
  const [queries, setQueries] = useState<ServiceQueries>({});
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const locale = useLocale();

  useEffect(() => {
    async function fetchQueries() {
      const newQueries: ServiceQueries = {};
      for (const service of services) {
        let endpoint = "";
        switch (service) {
          case "Tracking Data":
            endpoint = "/api/tracking-data/queries";
            break;
          case "Google Analytics":
            endpoint = "/api/google-analytics/queries";
            break;
          case "Google Ads":
            endpoint = "/api/google-ads/queries";
            break;
          case "Meta Ads":
            endpoint = "/api/meta-ads/queries";
            break;
          case "Microsoft Ads":
            endpoint = "/api/microsoft-ads/queries";
            break;
          default:
            break;
        }
        try {
          const res = await fetch(endpoint);
          if (res.ok) {
            const data = await res.json();
            newQueries[service] = data.queries.map((q: any) => ({
              id: q.id,
              queryName: q.queryName,
              createdAt: q.createdAt,
            }));
          } else {
            newQueries[service] = [];
          }
        } catch (error) {
          console.error(`Error fetching ${service} queries:`, error);
          newQueries[service] = [];
          toast({
            title: t("loadErrorTitle") || "Error loading queries",
            description:
              t("loadErrorDescription") || `Could not load ${service} queries`,
            variant: "destructive",
          });
        }
      }
      setQueries(newQueries);
      setLoading(false);
    }
    fetchQueries();
  }, [t]);

  const handleDelete = async (service: string, id: string) => {
    setDeletingIds((prev) => [...prev, id]);
    try {
      const res = await fetch(`/api/queries/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({
          title: t("deleteSuccessTitle"),
          description: t("deleteSuccessDescription"),
        });
        setQueries((prev) => ({
          ...prev,
          [service]: prev[service].filter((q) => q.id !== id),
        }));
      } else {
        toast({
          title: t("deleteErrorTitle"),
          description: t("deleteErrorDescription"),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t("deleteErrorTitle"),
        description: t("deleteErrorDescription"),
        variant: "destructive",
      });
    } finally {
      setDeletingIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Helper to derive the dashboard URL for a given service and query id
  const getRunUrl = (service: string, id: string) => {
    switch (service) {
      case "Tracking Data":
        return `/dashboard/tracking-data?selectedQuery=${id}`;
      case "Google Analytics":
        return `/dashboard/google-analytics?selectedQuery=${id}`;
      case "Google Ads":
        return `/dashboard/google-ads?selectedQuery=${id}`;
      case "Meta Ads":
        return `/dashboard/meta-ads?selectedQuery=${id}`;
      case "Microsoft Ads":
        return `/dashboard/microsoft-ads?selectedQuery=${id}`;
      default:
        return "/";
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="space-y-4">
          {services.map((service, idx) => (
            <div key={idx} className="border rounded p-4 space-y-3">
              <SkeletonLoader height="h-6" width="w-[180px]" />
              <div className="space-y-4 mt-4">
                <div className="py-2 border-b">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <SkeletonLoader height="h-5" width="w-[140px]" />
                      <SkeletonLoader height="h-3" width="w-[100px]" />
                    </div>
                    <div className="flex space-x-2">
                      <SkeletonLoader height="h-8" width="w-[60px]" />
                      <SkeletonLoader height="h-8" width="w-[60px]" />
                    </div>
                  </div>
                </div>
                <div className="py-2 border-b">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <SkeletonLoader height="h-5" width="w-[160px]" />
                      <SkeletonLoader height="h-3" width="w-[100px]" />
                    </div>
                    <div className="flex space-x-2">
                      <SkeletonLoader height="h-8" width="w-[60px]" />
                      <SkeletonLoader height="h-8" width="w-[60px]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        services.map((service) => (
          <details key={service} className="border rounded p-4">
            <summary className="font-bold">{service}</summary>
            {queries[service] && queries[service].length > 0 ? (
              queries[service].map((q) => (
                <div
                  key={q.id}
                  className="flex justify-between items-center py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{q.queryName}</p>
                    {q.createdAt && (
                      <p className="text-sm text-gray-500">
                        {format(new Date(q.createdAt), "PPP")}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        redirect({ href: getRunUrl(service, q.id), locale })
                      }
                    >
                      {t("runButton")}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(service, q.id)}
                      disabled={deletingIds.includes(q.id)}
                    >
                      {deletingIds.includes(q.id) ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                          {t("deleting") || "Deleting..."}
                        </div>
                      ) : (
                        t("deleteButton")
                      )}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 p-2">{t("noSavedQueries")}</p>
            )}
          </details>
        ))
      )}
    </div>
  );
}
