import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { load } from "cheerio"; // changed import

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let url = body.url;
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }
    // Auto prepend "https://" if missing
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    };
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) {
      return NextResponse.json(
        { error: `Request failed: ${res.statusText}` },
        { status: res.status },
      );
    }
    const html = await res.text();
    const $ = load(html); // use load() from cheerio

    const trackingKeywords: Record<string, string> = {
      "googletagmanager.com": "Google Site Tag",
      "google-analytics.com": "Google Analytics",
      merchantGoogleAnalytics: "Google Analytics",
      "g.doubleclick.net": "Google Ads DoubleClick",
      "fbq(": "Facebook Pixel",
      facebook_pixel: "Facebook Pixel",
      "connect.facebook.net": "Facebook SDK",
      "bat.bing.com": "Bing Universal Event Tracking",
      "static.hotjar.com": "Hotjar",
      "cdn.amplitude.com": "Amplitude",
      "analytics.twitter.com": "Twitter Analytics",
      "snap.licdn.com": "LinkedIn Insight Tag",
      "quantserve.com": "Quantcast",
      "adroll.com": "AdRoll",
      "gtag('config'": "Google Site Tag",
      "myshopify.com": "Shopify",
      "chimpstatic.com": "Mailchimp",
      "boldapps.net": "Bold Commerce",
      "Google Ads Enhanced Conversion": "Google Ads Conversion Tracking",
      "automizely-analytics.com": "Automizely",
    };

    const analyticsTags = new Set<string>();

    // Check external script sources for keywords
    $("script[src]").each((i, el) => {
      const src = $(el).attr("src") || "";
      for (const [keyword, description] of Object.entries(trackingKeywords)) {
        if (src.includes(keyword)) {
          analyticsTags.add(description);
        }
      }
    });
    // Check inline script content
    $("script").each((i, el) => {
      const content = $(el).html() || "";
      for (const [keyword, description] of Object.entries(trackingKeywords)) {
        if (content.includes(keyword)) {
          analyticsTags.add(description);
        }
      }
    });
    // Check iframe sources
    $("iframe[src]").each((i, el) => {
      const src = $(el).attr("src") || "";
      for (const [keyword, description] of Object.entries(trackingKeywords)) {
        if (src.includes(keyword)) {
          analyticsTags.add(description);
        }
      }
    });

    const results = Array.from(analyticsTags);
    if (results.length > 0) {
      return NextResponse.json({ analytics_tags: results });
    } else {
      return NextResponse.json({
        message: "No analytics or tracking tags found.",
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred: " + error },
      { status: 500 },
    );
  }
}
