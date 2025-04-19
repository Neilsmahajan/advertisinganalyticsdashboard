"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { DownloadButton } from "@/components/DownloadButton";

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
  "Google Ads": "google-ads-logo.png",
  "Google Ads Conversion Tracking": "google-ads-logo.png",
  "Google Conversion Linker": "google-ads-logo.png",
  "Facebook Pixel": "meta-ads-logo.png",
  "Facebook SDK": "meta-ads-logo.png",
  "Facebook Conversion Tracking": "meta-ads-logo.png",
  "Facebook Domain Verification": "meta-ads-logo.png",
  "Bing Universal Event Tracking": "bing-logo.png",
  "Bing Ads": "bing-logo.png",
  "Microsoft Clarity": "microsoft-logo.png",
  Hotjar: "hotjar-logo.png",
  Amplitude: "amplitude-logo.png",
  "Twitter Analytics": "x-ads-logo.png",
  "LinkedIn Insight Tag": "linkedin-ads-logo.png",
  Quantcast: "quantcast-logo.png",
  AdRoll: "adroll-logo.jpg",
  Shopify: "shopify-logo.png",
  Mailchimp: "mailchimp-logo.png",
  "Bold Commerce": "bold-commerce-logo.png",
  Automizely: "automizely-logo.png",
  Pipedrive: "pipedrive-logo.png",
  "Matomo Analytics": "matomo-logo.png",
  "Plausible Analytics": "plausible-logo.png",
  Segment: "segment-logo.png",
  Mixpanel: "mixpanel-logo.png",
  Intercom: "intercom-logo.png",
  Kissmetrics: "kissmetrics-logo.png",
  "Crazy Egg": "crazyegg-logo.png",
  Optimizely: "optimizely-logo.png",
  Woopra: "woopra-logo.png",
  "Heap Analytics": "heap-logo.png",
  FullStory: "fullstory-logo.png",
  HubSpot: "hubspot-logo.png",
  Pardot: "pardot-logo.png",
  Drift: "drift-logo.png",
  Zendesk: "zendesk-logo.png",
  "Tawk.to": "tawkto-logo.png",
  Crisp: "crisp-logo.png",
  LiveChat: "livechat-logo.png",
  Olark: "olark-logo.png",
  Mouseflow: "mouseflow-logo.png",
  ClickTale: "clicktale-logo.png",
  Pingdom: "pingdom-logo.png",
  "New Relic": "newrelic-logo.png",
  Dynatrace: "dynatrace-logo.png",
  Contentsquare: "contentsquare-logo.png",
  "Adobe Analytics": "adobe-analytics-logo.png",
  "Adobe Audience Manager": "adobe-audience-manager-logo.png",
};

export default function TrackingDataResultsSection({
  results,
  userInfo,
  queryInfo,
}: TrackingDataResultsSectionProps) {
  const t = useTranslations("TrackingDataResultsSection");
  const locale = useLocale();
  const [isDownloading, setIsDownloading] = useState(false);

  // extract website domain from queryInfo
  const websiteUrlRaw = (queryInfo.queryData.websiteURL as string) || "";
  const websiteDomain = websiteUrlRaw
    .replace(/(^\w+:|^)\/\//, "")
    .replace(/\/+$/, "");

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch("/api/tracking-data/download-report", {
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
                      {t(`tagDescriptions.${tag}`, { fallback: tag })}
                    </p>
                    {(tag === "Google Ads DoubleClick" ||
                      tag === "Google Ads" ||
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
                    {(tag === "Facebook Pixel" ||
                      tag === "Facebook SDK" ||
                      tag === "Facebook Conversion Tracking") &&
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
                    {(tag === "Bing Universal Event Tracking" ||
                      tag === "Bing Ads") &&
                      websiteDomain && (
                        <a
                          href={`https://www.bing.com/search?q=site:${websiteDomain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline"
                        >
                          {t("viewBingPage")}
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
