"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { locale } = useParams(); // retrieve current locale from URL
  const t = useTranslations("Navbar");
  const languages = ["English", "Français"];
  const currentLangLabel = locale === "fr" ? "FR" : "EN";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/cropped-advertising-analytics-dashboard-logo.png"
              alt={t("logoAlt")}
              width={40}
              height={40}
              className="rounded-md"
            />
            {/* <span className="hidden font-bold sm:inline-block">
              Advertising Analytics Dashboard
            </span> */}
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {t("home")}
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="link"
                className="text-sm font-medium transition-colors hover:text-primary p-0"
              >
                {t("services")} <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/tracking-data">{t("trackingData")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/google-analytics">
                  {t("googleAnalytics")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/google-ads">{t("googleAds")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/meta-ads">{t("metaAds")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/microsoft-ads">{t("microsoftAds")}</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link
            href="/about"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {t("about")}
          </Link>
          <Link
            href="/privacy"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {t("privacy")}
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {t("contact")}
          </Link>
          {/* New Language Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1">
                {t("language")} <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {languages.map((lang, index) => (
                <DropdownMenuItem
                  key={lang}
                  onClick={() => {
                    const pathWithoutLocale = window.location.pathname.replace(
                      /^\/[a-z]{2}/,
                      "",
                    );
                    const newLocale = index === 0 ? "en" : "fr";
                    window.location.href = `/${newLocale}${pathWithoutLocale}`;
                  }}
                >
                  {lang}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/account">
            <Button variant="ghost" size="sm" className="hidden md:flex">
              {t("myAccount")}
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm">{t("dashboard")}</Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t("toggleMenu")}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 pt-6">
                <Link
                  href="/"
                  className="text-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("home")}
                </Link>
                <div className="space-y-3">
                  <p className="text-lg font-medium">{t("services")}</p>
                  <div className="flex flex-col gap-2 pl-4">
                    <Link
                      href="/dashboard/tracking-data"
                      className="text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("trackingData")}
                    </Link>
                    <Link
                      href="/dashboard/google-analytics"
                      className="text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("googleAnalytics")}
                    </Link>
                    <Link
                      href="/dashboard/google-ads"
                      className="text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("googleAds")}
                    </Link>
                    <Link
                      href="/dashboard/meta-ads"
                      className="text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("metaAds")}
                    </Link>
                    <Link
                      href="/dashboard/microsoft-ads"
                      className="text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("microsoftAds")}
                    </Link>
                  </div>
                </div>
                <Link
                  href="/about"
                  className="text-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("about")}
                </Link>
                <Link
                  href="/privacy"
                  className="text-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("privacy")}
                </Link>
                <Link
                  href="/contact"
                  className="text-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("contact")}
                </Link>
                <Link
                  href="/account"
                  className="text-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("myAccount")}
                </Link>
                <Link
                  href="/dashboard"
                  className="text-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("dashboard")}
                </Link>
                {/* New Mobile Language Section */}
                <div className="space-y-3">
                  <p className="text-lg font-medium">{t("language")}</p>
                  <div className="flex flex-col gap-2 pl-4">
                    {languages.map((lang, index) => (
                      <button
                        key={lang}
                        className="text-sm text-left"
                        onClick={() => {
                          const pathWithoutLocale =
                            window.location.pathname.replace(/^\/[a-z]{2}/, "");
                          const newLocale = index === 0 ? "en" : "fr";
                          window.location.href = `/${newLocale}${pathWithoutLocale}`;
                        }}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
