"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  BarChart3,
  LineChart,
  PieChart,
  BarChart,
  Clock,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { redirect } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Query {
  id: string;
  queryName: string;
  createdAt: string;
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

const serviceIcons: Record<string, React.ReactNode> = {
  "Tracking Data": <Search className="h-5 w-5" />,
  "Google Analytics": <BarChart3 className="h-5 w-5" />,
  "Google Ads": <LineChart className="h-5 w-5" />,
  "Meta Ads": <PieChart className="h-5 w-5" />,
  "Microsoft Ads": <BarChart className="h-5 w-5" />,
};

const serviceKeys: Record<string, string> = {
  "Tracking Data": "tracking-data",
  "Google Analytics": "google-analytics",
  "Google Ads": "google-ads",
  "Meta Ads": "meta-ads",
  "Microsoft Ads": "microsoft-ads",
};

export default function DashboardQueries() {
  const t = useTranslations("DashboardQueries");
  const [queries, setQueries] = useState<ServiceQueries>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(services[0]);
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
        }
      }
      setQueries(newQueries);
      setLoading(false);
    }
    fetchQueries();
  }, []);

  const handleDelete = async (service: string, id: string) => {
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
      console.error("Error deleting query:", error);
      toast({
        title: t("deleteErrorTitle"),
        description: t("deleteErrorDescription"),
        variant: "destructive",
      });
    }
  };

  const handleRun = (service: string, id: string) => {
    const path = `/dashboard/${serviceKeys[service]}?selectedQuery=${id}`;
    redirect({ href: path, locale });
  };

  const getQueryCountBadge = (service: string) => {
    const count = queries[service]?.length || 0;
    return (
      <Badge variant="secondary" className="ml-2">
        {count}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue={services[0]}
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {services.map((service) => (
            <TabsTrigger
              key={service}
              value={service}
              className="flex items-center justify-center"
            >
              <span className="flex items-center">
                <span className="mr-2">{serviceIcons[service]}</span>
                <span className="hidden md:inline">{service}</span>
                {!loading && getQueryCountBadge(service)}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {services.map((service) => (
          <TabsContent key={service} value={service} className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                // Skeleton loaders while loading
                Array(3)
                  .fill(0)
                  .map((_, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <Skeleton className="h-4 w-3/4" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
              ) : queries[service] && queries[service].length > 0 ? (
                queries[service].map((query) => (
                  <Card
                    key={query.id}
                    className="overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        {serviceIcons[service]}
                        <span className="ml-2 truncate">{query.queryName}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground flex items-center mb-4">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(query.createdAt), "PPP")}
                      </p>
                      <div className="flex justify-between items-center">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleRun(service, query.id)}
                          className="flex items-center"
                        >
                          {t("runButton")}
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(service, query.id)}
                          className="flex items-center text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground mb-4">
                      {t("noSavedQueries")}
                    </p>
                    <Button
                      onClick={() =>
                        redirect({
                          href: `/dashboard/${serviceKeys[service]}`,
                          locale,
                        })
                      }
                    >
                      {t("createNewQuery")}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
