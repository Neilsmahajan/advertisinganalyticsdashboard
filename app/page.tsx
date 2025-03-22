import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Play,
  Search,
  BarChart3,
  LineChart,
  PieChart,
  LayoutDashboard,
  Clock,
  Users,
} from "lucide-react";
import SignInButton from "./SignInButton";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                ADVERTISING ANALYTICS DASHBOARD
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Manage and analyze all your advertising campaigns in one unified
                dashboard. Gain insights, track performance, and optimize
                results effortlessly.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Explore Services <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                <Play className="mr-2 h-4 w-4" /> Watch Video
              </Button>
              <SignInButton />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Key Features
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Why Use This Tool?
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg shadow-sm">
                <Search className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Tracking Data</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Find all analytics tags and tracking services on any website.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg shadow-sm">
                <LayoutDashboard className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Unified Dashboard</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Fetch data from Google, Meta, Microsoft, and more in one
                  interface.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg shadow-sm">
                <Clock className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Real-Time Data</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Multi-platform tracking with real-time insights.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg shadow-sm">
                <Users className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Multiple Accounts</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Save multiple ad accounts and switch between saved metrics
                  seamlessly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="py-20 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Supported Platforms
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Seamlessly Track Data And Integrate With:
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mt-8">
              <Link href="/dashboard/tracking-data">
                <div className="flex flex-col items-center space-y-2 p-6">
                  <Search className="h-16 w-16 text-primary" />
                  <h3 className="text-lg font-medium">Tracking Data</h3>
                </div>
              </Link>
              <Link href="/dashboard/google-analytics">
                <div className="flex flex-col items-center space-y-2 p-6">
                  <BarChart3 className="h-16 w-16 text-primary" />
                  <h3 className="text-lg font-medium">Google Analytics</h3>
                </div>
              </Link>
              <Link href="/dashboard/google-ads">
                <div className="flex flex-col items-center space-y-2 p-6">
                  <LineChart className="h-16 w-16 text-primary" />
                  <h3 className="text-lg font-medium">Google Ads</h3>
                </div>
              </Link>
              <Link href="/dashboard/meta-ads">
                <div className="flex flex-col items-center space-y-2 p-6">
                  <PieChart className="h-16 w-16 text-primary" />
                  <h3 className="text-lg font-medium">Meta Ads</h3>
                </div>
              </Link>
              <Link href="/dashboard/microsoft-ads">
                <div className="flex flex-col items-center space-y-2 p-6">
                  <BarChart3 className="h-16 w-16 text-primary" />
                  <h3 className="text-lg font-medium">Microsoft Ads</h3>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready To Transform Your Advertising Strategy?
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link href="/dashboard">
                  Explore Services <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <SignInButton />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
