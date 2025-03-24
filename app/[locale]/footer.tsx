import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("Footer");
  return (
    <footer className="bg-muted/40 border-t">
      <div className="container px-4 py-12 md:px-6 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/cropped-advertising-analytics-dashboard-logo.png"
                alt={t("logoAlt")}
                width={40}
                height={40}
                className="rounded-md"
              />
              <span className="font-bold">{t("companyName")}</span>
            </Link>
            <p className="text-sm text-muted-foreground">{t("tagline")}</p>
            <div className="flex gap-4">
              <Link
                href="https://www.facebook.com/advertisinganalyticsdashboard/"
                className="text-muted-foreground hover:text-primary"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">{t("facebook")}</span>
              </Link>
              <Link
                href="https://www.instagram.com/advertisinganalyticsdashboard/"
                className="text-muted-foreground hover:text-primary"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">{t("instagram")}</span>
              </Link>
              <Link
                href="https://www.linkedin.com/company/advertisinganalyticsdashboard/"
                className="text-muted-foreground hover:text-primary"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">{t("linkedin")}</span>
              </Link>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-medium">{t("servicesHeader")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/dashboard/tracking-data"
                  className="text-muted-foreground hover:text-primary"
                >
                  {t("trackingData")}
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/google-analytics"
                  className="text-muted-foreground hover:text-primary"
                >
                  {t("googleAnalytics")}
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/google-ads"
                  className="text-muted-foreground hover:text-primary"
                >
                  {t("googleAds")}
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/meta-ads"
                  className="text-muted-foreground hover:text-primary"
                >
                  {t("metaAds")}
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/microsoft-ads"
                  className="text-muted-foreground hover:text-primary"
                >
                  {t("microsoftAds")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-medium">{t("companyHeader")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary"
                >
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary"
                >
                  {t("privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-primary"
                >
                  {t("termsOfService")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary"
                >
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-medium">{t("socialsHeader")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="https://www.facebook.com/advertisinganalyticsdashboard/"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="h-5 w-5" />
                  <span className="sr-only">{t("facebook")}</span>
                  {t("facebook")}
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.instagram.com/advertisinganalyticsdashboard/"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">{t("instagram")}</span>
                  {t("instagram")}
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.linkedin.com/company/advertisinganalyticsdashboard/"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="h-5 w-5" />
                  <span className="sr-only">{t("linkedin")}</span>
                  {t("linkedin")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>{t("rightsReserved", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
