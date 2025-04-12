import { MetadataRoute } from "next";

// Base URL for the website
const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://advertisinganalytics.vercel.app";

// Define the supported locales
const locales = ["en", "fr"];

// Define public pages that should be included in the sitemap
const publicPages = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/terms", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "monthly", priority: 0.5 },
  { path: "/user-data-deletion", changeFrequency: "monthly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemap: MetadataRoute.Sitemap = [];

  // Add root pages
  publicPages.forEach((page) => {
    sitemap.push({
      url: `${baseUrl}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency as "weekly" | "monthly",
      priority: page.priority,
    });
  });

  // Add localized pages
  locales.forEach((locale) => {
    publicPages.forEach((page) => {
      sitemap.push({
        url: `${baseUrl}/${locale}${page.path !== "/" ? page.path : ""}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency as "weekly" | "monthly",
        priority: page.priority * 0.9, // Slightly lower priority for localized versions
      });
    });
  });

  return sitemap;
}
