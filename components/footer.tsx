import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-muted/40 border-t">
      <div className="container px-4 py-12 md:px-6 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cropped-advertising-analytics-dashboard-logo-Yg1JRKxaA3ZMzwMaRVYnv8HDKk2Vcb.png"
                alt="Advertising Analytics Dashboard Logo"
                width={40}
                height={40}
                className="rounded-md"
              />
              <span className="font-bold">Advertising Analytics</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Manage and analyze all your advertising campaigns in one unified dashboard.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-medium">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard/tracking-data" className="text-muted-foreground hover:text-primary">
                  Tracking Data
                </Link>
              </li>
              <li>
                <Link href="/dashboard/google-analytics" className="text-muted-foreground hover:text-primary">
                  Google Analytics
                </Link>
              </li>
              <li>
                <Link href="/dashboard/google-ads" className="text-muted-foreground hover:text-primary">
                  Google Ads
                </Link>
              </li>
              <li>
                <Link href="/dashboard/meta-ads" className="text-muted-foreground hover:text-primary">
                  Meta Ads
                </Link>
              </li>
              <li>
                <Link href="/dashboard/microsoft-ads" className="text-muted-foreground hover:text-primary">
                  Microsoft Ads
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-medium">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary">
                  About
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-medium">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Status
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Advertising Analytics Dashboard. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

