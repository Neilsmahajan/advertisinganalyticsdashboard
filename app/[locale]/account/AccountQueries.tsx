"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { redirect } from "@/i18n/navigation";
import { useLocale } from "next-intl";

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
  const [queries, setQueries] = useState<ServiceQueries>({});
  const [loading, setLoading] = useState(true);
  const locale = useLocale(); // move the hook call here

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
      }
      setQueries(newQueries);
      setLoading(false);
    }
    fetchQueries();
  }, []);

  const handleDelete = async (service: string, id: string) => {
    const res = await fetch(`/api/queries/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Deleted", description: "Query deleted successfully." });
      setQueries((prev) => ({
        ...prev,
        [service]: prev[service].filter((q) => q.id !== id),
      }));
    } else {
      toast({
        title: "Error",
        description: "Failed to delete query.",
        variant: "destructive",
      });
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
        <p>Loading queries...</p>
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
                      Run
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(service, q.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No saved queries.</p>
            )}
          </details>
        ))
      )}
    </div>
  );
}
