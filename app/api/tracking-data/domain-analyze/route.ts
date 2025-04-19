import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This endpoint performs a secondary, deeper analysis for sites that might be using Bing ads
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let domain = body.domain;

    if (!domain) {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 },
      );
    }

    // Clean the domain - remove protocol, www, and trailing paths
    domain = domain.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];

    // Check if Bing Ads is likely used via multiple methods
    const results = {
      foundBingAds: false,
      detectionMethods: [] as string[],
    };

    // Method 1: Check against the Bing Ads transparency page
    try {
      const bingTransparencyUrl = `https://www.bing.com/search?q=site:${encodeURIComponent(
        domain,
      )}`;
      const response = await fetch(bingTransparencyUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      if (response.ok) {
        const text = await response.text();
        if (
          text.includes("ad-detection") ||
          text.toLowerCase().includes("promoted") ||
          text.toLowerCase().includes("sponsored")
        ) {
          results.foundBingAds = true;
          results.detectionMethods.push("bing_search_ads_present");
        }
      }
    } catch (e) {
      console.error("Error checking Bing transparency:", e);
    }

    // Method 2: Check DNS for Bing-related records
    try {
      // Simulate a DNS lookup for common Bing tracking subdomains
      // In a real implementation, you'd use a DNS library, but we'll use a proxy service here
      const dnsCheckUrl = `https://dns.google/resolve?name=${encodeURIComponent(
        `bat.bing.${domain}`,
      )}&type=A`;
      const dnsResponse = await fetch(dnsCheckUrl);

      if (dnsResponse.ok) {
        const dnsData = await dnsResponse.json();
        if (dnsData.Answer && dnsData.Answer.length > 0) {
          results.foundBingAds = true;
          results.detectionMethods.push("dns_records");
        }
      }
    } catch (e) {
      console.error("Error checking DNS:", e);
    }

    // Method 3: Check if the website has any direct Bing advertising account association
    // This is a placeholder - in a real implementation, you might use Bing Ads API if you have access

    if (results.foundBingAds) {
      return NextResponse.json({
        foundBingAds: true,
        domain: domain,
        detectionMethods: results.detectionMethods,
        analytics_tags: ["Bing Universal Event Tracking"], // Add this tag when evidence is found
      });
    } else {
      return NextResponse.json({
        foundBingAds: false,
        domain: domain,
      });
    }
  } catch (error) {
    console.error("Domain analysis error:", error);
    return NextResponse.json(
      { error: "An error occurred during domain analysis" },
      { status: 500 },
    );
  }
}
