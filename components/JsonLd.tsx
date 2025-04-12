import React from "react";

interface JsonLdProps {
  data: Record<string, any>;
}

// This component outputs schema.org JSON-LD data in a script tag
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Organization schema for consistent branding across search results
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Advertising Analytics Dashboard",
    url:
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://advertisinganalytics.vercel.app",
    logo: `${process.env.NEXT_PUBLIC_APP_URL || "https://advertisinganalytics.vercel.app"}/cropped-advertising-analytics-dashboard-logo.png`,
    sameAs: [
      "https://twitter.com/advertisinganalytics",
      "https://www.linkedin.com/company/advertisinganalytics",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "support@advertisinganalytics.com",
      availableLanguage: ["English", "French"],
    },
  };

  return <JsonLd data={data} />;
}

// Software application schema specifically for the dashboard
export function SoftwareApplicationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Advertising Analytics Dashboard",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1024",
    },
  };

  return <JsonLd data={data} />;
}

// FAQPage schema for common questions
export function FaqJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What platforms does Advertising Analytics Dashboard support?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our dashboard supports Google Ads, Google Analytics, Meta Ads, Microsoft Ads, and custom tracking data.",
        },
      },
      {
        "@type": "Question",
        name: "Is Advertising Analytics Dashboard free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, we offer a free tier with basic analytics features. Premium features are available with paid plans.",
        },
      },
      {
        "@type": "Question",
        name: "How secure is my advertising data?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We use industry-standard encryption and security practices to protect your data. All connections are secured with SSL, and we do not share your data with third parties.",
        },
      },
    ],
  };

  return <JsonLd data={data} />;
}
