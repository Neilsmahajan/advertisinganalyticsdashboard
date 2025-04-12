import type React from "react";
import type { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/app/[locale]/navbar";
import Footer from "@/app/[locale]/footer";
import "./globals.css";
import AuthProvider from "./AuthProvider";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { OrganizationJsonLd } from "@/components/JsonLd";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title:
    "Advertising Analytics Dashboard | Unified Marketing Analytics Platform",
  description:
    "Analyze and optimize all your advertising campaigns in one unified dashboard. Track performance across Google, Meta, Microsoft, and other platforms.",
  generator: "Next.js",
  applicationName: "Advertising Analytics Dashboard",
  keywords: [
    "advertising analytics",
    "marketing dashboard",
    "campaign reporting",
    "Google Ads analytics",
    "Meta Ads reporting",
    "Microsoft Ads dashboard",
    "cross-platform analytics",
    "marketing ROI",
    "ad performance tracking",
  ],
  authors: [{ name: "Advertising Analytics Team" }],
  creator: "Advertising Analytics Dashboard",
  publisher: "Advertising Analytics Dashboard",
  formatDetection: {
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
      "https://advertisinganalytics.vercel.app",
  ),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en",
      "fr-FR": "/fr",
    },
  },
  openGraph: {
    title: "Advertising Analytics Dashboard",
    description:
      "Unified platform for tracking and analyzing all your advertising campaigns",
    url: "https://advertisinganalytics.vercel.app",
    siteName: "Advertising Analytics Dashboard",
    images: [
      {
        url: "/cropped-advertising-analytics-dashboard-logo.png",
        width: 1200,
        height: 630,
        alt: "Advertising Analytics Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Advertising Analytics Dashboard",
    description:
      "Unified platform for tracking and analyzing all your advertising campaigns",
    images: ["/cropped-advertising-analytics-dashboard-logo.png"],
    creator: "@advertisinganalytics",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: [{ url: "/apple-icon.png" }],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  return (
    <AuthProvider>
      <html lang={locale} suppressHydrationWarning>
        <head>
          <OrganizationJsonLd />
        </head>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex min-h-screen flex-col">
              <NextIntlClientProvider>
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </NextIntlClientProvider>
            </div>
          </ThemeProvider>
        </body>
      </html>
    </AuthProvider>
  );
}
