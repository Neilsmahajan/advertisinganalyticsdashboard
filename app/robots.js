import { MetadataRoute } from "next";

export default function robots() {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://advertisinganalytics.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/about", "/contact", "/privacy", "/terms"],
      disallow: ["/dashboard/", "/account/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
