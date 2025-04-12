import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Advertising Analytics Dashboard",
    short_name: "Ad Analytics",
    description:
      "Unified dashboard for tracking and analyzing advertising campaigns across multiple platforms",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#47adbf",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-192x192-maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512x512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/dashboard-desktop.png",
        sizes: "1920x1080",
        type: "image/png",
        form_factor: "wide",
      },
      {
        src: "/screenshots/dashboard-mobile.png",
        sizes: "750x1334",
        type: "image/png",
        form_factor: "narrow",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        url: "/dashboard",
        description: "View your analytics dashboard",
      },
      {
        name: "Google Ads",
        url: "/dashboard/google-ads",
        description: "Google Ads analytics",
      },
      {
        name: "Meta Ads",
        url: "/dashboard/meta-ads",
        description: "Meta Ads analytics",
      },
    ],
  };
}
