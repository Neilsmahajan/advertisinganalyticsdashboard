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

    // Enhanced tracking keywords with more comprehensive patterns
    const trackingKeywords: Record<string, string> = {
      // Google Services
      "googletagmanager.com": "Google Site Tag",
      gtag: "Google Site Tag",
      gtm: "Google Site Tag",
      "google-analytics.com": "Google Analytics",
      "analytics.js": "Google Analytics",
      "ga.js": "Google Analytics",
      googleanalytics: "Google Analytics",
      merchantGoogleAnalytics: "Google Analytics",
      "g.doubleclick.net": "Google Ads DoubleClick",
      "doubleclick.net": "Google Ads DoubleClick",
      googlesyndication: "Google Ads",
      googleadservices: "Google Ads",
      "google-adwords": "Google Ads",
      adwords: "Google Ads",
      google_conversion_id: "Google Ads Conversion Tracking",
      google_conversion_label: "Google Ads Conversion Tracking",
      gclaw: "Google Ads Conversion Tracking",
      gclsrc: "Google Ads Conversion Tracking",
      gclid: "Google Ads Conversion Tracking",
      "conversion_async.js": "Google Conversion Linker",
      conversion_linker: "Google Conversion Linker",
      goog_conversion_linker: "Google Conversion Linker",

      // Facebook Services
      "fbq(": "Facebook Pixel",
      facebook_pixel: "Facebook Pixel",
      "fbevents.js": "Facebook Pixel",
      "connect.facebook.net": "Facebook SDK",
      "facebook-jssdk": "Facebook SDK",
      _fbp: "Facebook Pixel",
      "fb-root": "Facebook SDK",
      "facebook.com/tr": "Facebook Conversion Tracking",
      "facebook-domain-verification": "Facebook Domain Verification",
      "pixel-id": "Facebook Pixel",

      // Microsoft/Bing Services - Enhanced
      "bat.bing.com": "Bing Universal Event Tracking",
      "uet.bing": "Bing Universal Event Tracking",
      "bing_p.js": "Bing Universal Event Tracking",
      mstag: "Bing Universal Event Tracking",
      "window.uetq": "Bing Universal Event Tracking",
      "uetq =": "Bing Universal Event Tracking",
      "uet tag": "Bing Universal Event Tracking",
      "o={ti:": "Bing Universal Event Tracking",
      "microsoft.com/uet": "Bing Universal Event Tracking",
      MicrosoftTag: "Bing Universal Event Tracking",
      "Microsoft.UET": "Bing Universal Event Tracking",
      "UET.js": "Bing Universal Event Tracking",
      "UET:": "Bing Universal Event Tracking",
      "UET/": "Bing Universal Event Tracking",
      msclkid: "Bing Ads",
      "bing ads": "Bing Ads",
      "microsoft advertising": "Bing Ads",
      "clarity.ms": "Microsoft Clarity",
      ms_clarity: "Microsoft Clarity",

      // Other Analytics Tools
      "static.hotjar.com": "Hotjar",
      "hotjar.com": "Hotjar",
      hjid: "Hotjar",
      "cdn.amplitude.com": "Amplitude",
      "amplitude.com": "Amplitude",
      "analytics.twitter.com": "Twitter Analytics",
      "snap.licdn.com": "LinkedIn Insight Tag",
      "linkedin.com/insight": "LinkedIn Insight Tag",
      _linkedin_data_partner_id: "LinkedIn Insight Tag",
      "quantserve.com": "Quantcast",
      "adroll.com": "AdRoll",
      "myshopify.com": "Shopify",
      "chimpstatic.com": "Mailchimp",
      "list-manage.com": "Mailchimp",
      "boldapps.net": "Bold Commerce",
      "automizely-analytics.com": "Automizely",

      // Additional Analytics Tools
      pipedrive: "Pipedrive",
      "pipedriveassets.com": "Pipedrive",
      "leadbooster-chat.pipedrive.com": "Pipedrive",
      pipedrivewebforms: "Pipedrive",
      matomo: "Matomo Analytics",
      piwik: "Matomo Analytics",
      "plausible.io": "Plausible Analytics",
      "segment.com": "Segment",
      "segment.io": "Segment",
      "mixpanel.com": "Mixpanel",
      intercom: "Intercom",
      kissmetrics: "Kissmetrics",
      crazyegg: "Crazy Egg",
      optimizely: "Optimizely",
      woopra: "Woopra",
      "heap.io": "Heap Analytics",
      "fullstory.com": "FullStory",
      hubspot: "HubSpot",
      "hs-scripts": "HubSpot",
      "hs-analytics": "HubSpot",
      pardot: "Pardot",
      "pd.js": "Pardot",
      "drift.com": "Drift",
      zendesk: "Zendesk",
      zdassets: "Zendesk",
      "tawk.to": "Tawk.to",
      "crisp.chat": "Crisp",
      livechat: "LiveChat",
      olark: "Olark",
      mouseflow: "Mouseflow",
      clicktale: "ClickTale",
      pingdom: "Pingdom",
      newrelic: "New Relic",
      dynatrace: "Dynatrace",
      contentsquare: "Contentsquare",
      "adobe.com/analytics": "Adobe Analytics",
      sitecatalyst: "Adobe Analytics",
      omniture: "Adobe Analytics",
      demdex: "Adobe Audience Manager",
    };

    const analyticsTags = new Set<string>();

    // Check external script sources for keywords
    $("script[src]").each((i, el) => {
      const src = $(el).attr("src") || "";
      for (const [keyword, description] of Object.entries(trackingKeywords)) {
        if (src.toLowerCase().includes(keyword.toLowerCase())) {
          analyticsTags.add(description);
        }
      }
    });

    // Check inline script content more thoroughly
    $("script").each((i, el) => {
      const content = $(el).html() || "";

      // Check for specific Bing UET tag patterns
      if (
        content.match(/window\.uetq\s*=\s*window\.uetq\s*\|\|\s*\[\]/) ||
        content.match(/var\s+uetq\s*=\s*uetq\s*\|\|\s*\[\]/) ||
        content.match(/var\s+o\s*=\s*{\s*ti:\s*["'][0-9]+["']/) ||
        content.match(/o\s*=\s*{\s*ti:\s*["'][0-9]+["']/) ||
        content.includes("UET.setup(") ||
        content.includes(".UetData.")
      ) {
        analyticsTags.add("Bing Universal Event Tracking");
      }

      // Look for numeric UET IDs - typically 6-10 digits in length
      const uetIdMatches = content.match(/ti:["'](\d{6,10})["']/g);
      if (uetIdMatches) {
        analyticsTags.add("Bing Universal Event Tracking");
      }

      for (const [keyword, description] of Object.entries(trackingKeywords)) {
        if (content.toLowerCase().includes(keyword.toLowerCase())) {
          analyticsTags.add(description);
        }
      }
    });

    // Check iframe sources
    $("iframe[src]").each((i, el) => {
      const src = $(el).attr("src") || "";
      for (const [keyword, description] of Object.entries(trackingKeywords)) {
        if (src.toLowerCase().includes(keyword.toLowerCase())) {
          analyticsTags.add(description);
        }
      }
    });

    // Check meta tags for tracking related content
    $("meta").each((i, el) => {
      const name = $(el).attr("name") || "";
      const property = $(el).attr("property") || "";
      const content = $(el).attr("content") || "";

      // Facebook
      if (property.includes("og:") || property.includes("fb:")) {
        analyticsTags.add("Facebook SDK");
      }

      // Facebook domain verification
      if (name.includes("facebook-domain-verification")) {
        analyticsTags.add("Facebook Domain Verification");
      }

      // Check content for tracking related patterns
      for (const [keyword, description] of Object.entries(trackingKeywords)) {
        if (
          name.toLowerCase().includes(keyword.toLowerCase()) ||
          property.toLowerCase().includes(keyword.toLowerCase()) ||
          content.toLowerCase().includes(keyword.toLowerCase())
        ) {
          analyticsTags.add(description);
        }
      }
    });

    // Check link tags (e.g. for preconnect, dns-prefetch)
    $("link").each((i, el) => {
      const href = $(el).attr("href") || "";
      for (const [keyword, description] of Object.entries(trackingKeywords)) {
        if (href.toLowerCase().includes(keyword.toLowerCase())) {
          analyticsTags.add(description);
        }
      }
    });

    // Check div IDs and classes for tracking related names
    $("div, span").each((i, el) => {
      const id = $(el).attr("id") || "";
      const className = $(el).attr("class") || "";

      for (const [keyword, description] of Object.entries(trackingKeywords)) {
        if (
          id.toLowerCase().includes(keyword.toLowerCase()) ||
          className.toLowerCase().includes(keyword.toLowerCase())
        ) {
          analyticsTags.add(description);
        }
      }
    });

    // Check for noscript tags containing tracking pixels
    $("noscript").each((i, el) => {
      const content = $(el).html() || "";
      if (content.includes("facebook.com/tr") || content.includes("fbq(")) {
        analyticsTags.add("Facebook Pixel");
      }

      for (const [keyword, description] of Object.entries(trackingKeywords)) {
        if (content.toLowerCase().includes(keyword.toLowerCase())) {
          analyticsTags.add(description);
        }
      }
    });

    // Check HTML text for common tracking strings that might be in comments or attributes
    const htmlText = html.toLowerCase();

    // Enhanced Bing patterns
    const bingPatterns = [
      { pattern: 'ti:"', tag: "Bing Universal Event Tracking" },
      { pattern: "q.push(['ueta',", tag: "Bing Universal Event Tracking" },
      { pattern: "uet('send'", tag: "Bing Universal Event Tracking" },
      { pattern: "bat.bing.com/bat.js", tag: "Bing Universal Event Tracking" },
      { pattern: "bat.js", tag: "Bing Universal Event Tracking" },
      { pattern: "uetq.push", tag: "Bing Universal Event Tracking" },
    ];

    for (const { pattern, tag } of bingPatterns) {
      if (htmlText.includes(pattern)) {
        analyticsTags.add(tag);
      }
    }

    // Regex search for Bing UET IDs (commonly 6-10 digit numbers in specific contexts)
    // This helps detect obfuscated or minified Bing tracking code
    if (
      html.match(/bat\.js#?(\d{6,10})/) ||
      html.match(/uet#?(\d{6,10})/) ||
      html.match(/ti[=:]["'](\d{6,10})["']/) ||
      html.match(/microsoft\.com\/uet\/[^"']+(\d{6,10})/)
    ) {
      analyticsTags.add("Bing Universal Event Tracking");
    }

    // Common patterns that might be anywhere in the HTML
    const commonPatterns = [
      { pattern: "bing ads", tag: "Bing Ads" },
      { pattern: "facebook pixel", tag: "Facebook Pixel" },
      { pattern: "fb pixel", tag: "Facebook Pixel" },
      { pattern: "google analytics", tag: "Google Analytics" },
      { pattern: "google tag manager", tag: "Google Site Tag" },
      { pattern: "gtm-", tag: "Google Site Tag" },
      { pattern: "ua-", tag: "Google Analytics" },
      { pattern: "g-", tag: "Google Analytics" },
      { pattern: "pixel-id", tag: "Facebook Pixel" },
    ];

    for (const { pattern, tag } of commonPatterns) {
      if (htmlText.includes(pattern)) {
        analyticsTags.add(tag);
      }
    }

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
