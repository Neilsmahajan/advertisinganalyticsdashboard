"use client";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";
import React from "react";

interface MicrosoftAdsResultsSectionProps {
  results: {
    impressions: number;
    clicks: number;
    spend: string;
    campaigns: {
      CampaignId: string;
      CampaignName: string;
      Impressions: number;
      Clicks: number;
      Spend: string;
      Ctr: string;
    }[];
  };
  queryInfo: {
    service: string;
    queryName: string;
    queryData: Record<string, unknown>;
  };
}

export default function MicrosoftAdsResultsSection({
  results,
  queryInfo,
}: MicrosoftAdsResultsSectionProps) {
  const t = useTranslations("MicrosoftAdsResultsSection");
  const locale = useLocale();

  // New handler for downloading the report
  const handleDownloadReport = async () => {
    try {
      const response = await fetch("/api/microsoft-ads/download-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queryInfo,
          results,
          service: "Microsoft Ads",
          locale,
        }),
      });
      if (!response.ok) {
        console.error("Failed to generate report");
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "microsoft-ads-report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* New Download Report Button in Results card */}
      {/* <div className="flex gap-4">
        <Button
          className="bg-[#47adbf] hover:bg-[#47adbf]/90 text-white"
          onClick={handleDownloadReport}
        >
          {t("downloadReport")}
        </Button>
      </div> */}
      <div>
        <h3 className="text-xl font-bold mb-4">{t("results")}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/20 p-4 rounded-md">
            <p className="text-sm text-muted-foreground">Total Impressions</p>
            <p className="text-2xl font-bold">
              {results.impressions.toLocaleString()}
            </p>
          </div>
          <div className="bg-muted/20 p-4 rounded-md">
            <p className="text-sm text-muted-foreground">Total Clicks</p>
            <p className="text-2xl font-bold">
              {results.clicks.toLocaleString()}
            </p>
          </div>
          <div className="bg-muted/20 p-4 rounded-md col-span-2">
            <p className="text-sm text-muted-foreground">Total Spend</p>
            <p className="text-2xl font-bold">{results.spend}</p>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-4">{t("campaigns")}</h3>
        <div className="space-y-2">
          {results.campaigns && results.campaigns.length > 0 ? (
            results.campaigns.map((campaign) => (
              <div
                key={campaign.CampaignId}
                className="p-2 bg-muted/20 rounded-md"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{campaign.CampaignName}</span>
                  <span>{campaign.Spend}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>
                    {campaign.Impressions.toLocaleString()} impressions
                  </span>
                  <span>{campaign.Clicks.toLocaleString()} clicks</span>
                  <span>{campaign.Ctr}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-black/60">{t("noCampaigns")}</p>
          )}
        </div>
      </div>
      <div className="h-[150px] bg-muted/20 rounded-md flex items-center justify-center">
        <p className="text-muted-foreground">
          Campaign performance chart will appear here
        </p>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-4">
          {t("queryInformation") || "Query Information"}
        </h3>
        <div className="bg-white/10 rounded-lg p-6">
          <p>
            <strong>{t("service")}:</strong> {queryInfo.service}
          </p>
          <p>
            <strong>{t("queryName")}:</strong> {queryInfo.queryName}
          </p>
          <p>
            <strong>{t("queryData")}</strong>
          </p>
          <pre className="text-black/60">
            {JSON.stringify(queryInfo.queryData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
