"use client";

import { useState } from "react";
import Link from "next/link";
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

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/cropped-advertising-analytics-dashboard-logo.png"
              alt="Advertising Analytics Dashboard Logo"
              width={40}
              height={40}
              className="rounded-md"
            />
            <span className="hidden font-bold sm:inline-block">
              Advertising Analytics Dashboard
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Home
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="link"
                className="text-sm font-medium transition-colors hover:text-primary p-0"
              >
                Services <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/tracking-data">Tracking Data</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/google-analytics">Google Analytics</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/google-ads">Google Ads</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/meta-ads">Meta Ads</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/microsoft-ads">Microsoft Ads</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link
            href="/about"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            About
          </Link>
          <Link
            href="/privacy"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Privacy
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/account">
            <Button variant="ghost" size="sm" className="hidden md:flex">
              My Account
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm">Dashboard</Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 pt-6">
                <Link
                  href="/"
                  className="text-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <div className="space-y-3">
                  <p className="text-lg font-medium">Services</p>
                  <div className="flex flex-col gap-2 pl-4">
                    <Link
                      href="/dashboard/tracking-data"
                      className="text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Tracking Data
                    </Link>
                    <Link
                      href="/dashboard/google-analytics"
                      className="text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Google Analytics
                    </Link>
                    <Link
                      href="/dashboard/google-ads"
                      className="text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Google Ads
                    </Link>
                    <Link
                      href="/dashboard/meta-ads"
                      className="text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Meta Ads
                    </Link>
                    <Link
                      href="/dashboard/microsoft-ads"
                      className="text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Microsoft Ads
                    </Link>
                  </div>
                </div>
                <Link
                  href="/about"
                  className="text-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/privacy"
                  className="text-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Privacy
                </Link>
                <Link
                  href="/contact"
                  className="text-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link
                  href="/account"
                  className="text-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Account
                </Link>
                <Link
                  href="/dashboard"
                  className="text-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
