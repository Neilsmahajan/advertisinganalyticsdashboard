import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const VERCEL_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";
const PUBLIC_URL =
  process.env.NEXT_PUBLIC_APP_URL || VERCEL_URL || "http://localhost:3000";

const i18nMiddleware = createMiddleware({
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
  localePrefix: routing.localePrefix,
});

export default async function middleware(request: NextRequest) {
  // i18n middleware for handling locales
  const response = i18nMiddleware(request);

  // Apply Content Security Policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://www.googletagmanager.com https://www.google-analytics.com ${PUBLIC_URL};
    font-src 'self';
    connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com;
    frame-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `;

  // Add security headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-content-type-options", "nosniff");
  requestHeaders.set("x-frame-options", "DENY");
  requestHeaders.set("x-xss-protection", "1; mode=block");
  requestHeaders.set("referrer-policy", "strict-origin-when-cross-origin");

  // Only set CSP in production to avoid development issues
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Content-Security-Policy",
      cspHeader.replace(/\s{2,}/g, " ").trim(),
    );
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
