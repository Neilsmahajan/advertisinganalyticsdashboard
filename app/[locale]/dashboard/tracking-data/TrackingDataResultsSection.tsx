"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";
import { useTranslations, useLocale } from "next-intl";

interface TrackingDataResultsSectionProps {
  results: {
    analytics_tags?: string[];
    tag_descriptions?: Record<string, string>;
    message?: string;
  };
  userInfo: {
    name: string;
    email: string;
  };
  queryInfo: {
    service: string;
    queryName: string;
    queryData: Record<string, unknown>;
  };
}

const tagImages: Record<string, string> = {
  "Google Site Tag": "google-tag-manager-logo.png",
  "Google Analytics": "google-analytics-logo.png",
  "Google Ads DoubleClick": "google-ads-logo.png",
  "Facebook Pixel": "meta-ads-logo.png",
  "Facebook SDK": "meta-ads-logo.png",
  "Bing Universal Event Tracking": "bing-logo.png",
  Hotjar: "hotjar-logo.png",
  Amplitude: "amplitude-logo.png",
  "Twitter Analytics": "x-ads-logo.png",
  "LinkedIn Insight Tag": "linkedin-ads-logo.png",
  Quantcast: "quantcast-logo.png",
  AdRoll: "adroll-logo.jpg",
  Shopify: "shopify-logo.png",
  Mailchimp: "mailchimp-logo.png",
  "Bold Commerce": "bold-commerce-logo.png",
  "Google Ads Conversion Tracking": "google-ads-logo.png",
  Automizely: "automizely-logo.png",
};

export default function TrackingDataResultsSection({
  results,
  userInfo,
  queryInfo,
}: TrackingDataResultsSectionProps) {
  const t = useTranslations("TrackingDataResultsSection");
  const locale = useLocale();

  // extract website domain from queryInfo
  const websiteUrlRaw = (queryInfo.queryData.websiteURL as string) || "";
  const websiteDomain = websiteUrlRaw.replace(/(^\w+:|^)\/\//, "");

  const handleDownloadReport = async () => {
    try {
      const response = await fetch("/api/tracking-data/download_report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInfo,
          queryInfo,
          results,
          service: queryInfo.service,
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
      link.setAttribute("download", "report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* <div className="flex gap-4">
        <Button
          className="bg-[#47adbf] hover:bg-[#47adbf]/90 text-white"
          onClick={handleDownloadReport}
        >
          {t("downloadReport")}
        </Button>
      </div> */}
      <div>
        <div className="bg-white/10 rounded-lg p-6">
          {results.analytics_tags ? (
            <ul className="list-disc list-inside text-black/60">
              {results.analytics_tags.map((tag: string, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  {tagImages[tag] && (
                    <Image
                      src={`/${tagImages[tag]}`}
                      alt={tag}
                      width={24}
                      height={24}
                      className="inline-block"
                    />
                  )}
                  <div>
                    <span>{tag}</span>
                    <p className="text-sm text-black/50">
                      {t(`tagDescriptions.${tag}`)}
                    </p>
                    {(tag === "Google Ads DoubleClick" ||
                      tag === "Google Ads Conversion Tracking") &&
                      websiteDomain && (
                        <a
                          href={`https://adstransparency.google.com/?region=anywhere&domain=${websiteDomain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline"
                        >
                          {t("viewActiveGoogleAds")}
                        </a>
                      )}
                    {(tag === "Facebook Pixel" || tag === "Facebook SDK") &&
                      websiteDomain && (
                        <a
                          href={`https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=${websiteDomain}&search_type=keyword_unordered`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline"
                        >
                          {t("viewActiveMetaAds")}
                        </a>
                      )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-black/60">{t("resultsWillAppear")}</p>
          )}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-4">{t("queryInformation")}</h3>
        <div className="bg-white/10 rounded-lg p-6">
          <p>
            <strong>{t("service")}</strong> {queryInfo.service}
          </p>
          <p>
            <strong>{t("queryName")}</strong> {queryInfo.queryName}
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
