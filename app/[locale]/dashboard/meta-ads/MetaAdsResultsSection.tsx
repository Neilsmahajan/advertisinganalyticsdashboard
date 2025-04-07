"use client";
import { useTranslations, useLocale } from "next-intl";
import React, { useState } from "react";
import { DownloadButton } from "@/components/DownloadButton";

interface MetaAdsResultsSectionProps {
  results: {
    impressions: number;
    clicks: number;
    cost: string;
    reach: number;
    campaigns: {
      name: string;
      impressions: number;
      clicks: number;
      cost: string;
      reach: number;
    }[];
  };
  queryInfo: {
    service: string;
    queryName: string;
    queryData: Record<string, unknown>;
  };
  userInfo: { name: string; email: string };
}

export default function MetaAdsResultsSection({
  results,
  queryInfo,
  userInfo,
}: MetaAdsResultsSectionProps) {
  const t = useTranslations("MetaAdsResultsSection");
  const locale = useLocale();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch("/api/meta-ads/download-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInfo,
          queryInfo,
          results,
          service: "Meta Ads",
          locale,
        }),
      });
      if (!response.ok) {
        console.error("Failed to generate Meta Ads report");
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "meta-ads-report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error generating Meta Ads report:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <DownloadButton
          isLoading={isDownloading}
          onClick={handleDownloadReport}
          text={t("downloadReport")}
          loadingText={t("generatingReport")}
        />
      </div>
      <div>
        <h3 className="text-xl font-bold mb-4">{t("results")}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-blue-200">
            <thead className="bg-[#47adbf]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  {t("metric")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  {t("value")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-blue-50 divide-y divide-blue-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                  {t("impressions")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                  {results.impressions.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                  {t("clicks")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                  {results.clicks.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                  {t("cost")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                  {results.cost}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                  {t("reach")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                  {results.reach.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-4">{t("campaigns")}</h3>
        <div className="space-y-2">
          {results.campaigns.length > 0 ? (
            results.campaigns.map((campaign, index) => (
              <div key={index} className="p-2 bg-muted/20 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{campaign.name}</span>
                  <span>{campaign.cost}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>
                    {campaign.impressions.toLocaleString()} {t("impressions")}
                  </span>
                  <span>
                    {campaign.clicks.toLocaleString()} {t("clicks")}
                  </span>
                  <span>
                    {campaign.reach.toLocaleString()} {t("reach")}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-black/60">{t("noCampaigns")}</p>
          )}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-4">{t("queryInformation")}</h3>
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
