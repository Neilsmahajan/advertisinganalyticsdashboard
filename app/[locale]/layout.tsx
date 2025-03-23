import type React from "react";
import type { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import "./globals.css";
import AuthProvider from "./AuthProvider";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Advertising Analytics Dashboard",
  description:
    "Manage and analyze all your advertising campaigns in one unified dashboard",
  generator: "v0.dev",
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
