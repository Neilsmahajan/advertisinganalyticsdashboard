import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest } from "next/server";

// Update locale detection to return URL code values
function detectLocale(request: NextRequest): "en" | "fr" {
  const acceptLanguage = request.headers.get("accept-language") || "";
  return acceptLanguage.includes("fr-CA") ? "fr" : "en";
}

export default function middleware(request: NextRequest) {
  const defaultLocale = detectLocale(request);
  return createMiddleware({ ...routing, defaultLocale })(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
