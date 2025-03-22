import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BarChart3, Clock, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container px-4 py-12 md:px-6 md:py-20">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            ABOUT ADVERTISING ANALYTICS DASHBOARD
          </h1>
          <p className="text-gray-500 dark:text-gray-400 md:text-lg">
            At Advertising Analytics Dashboard, our mission is to simplify the
            way businesses manage and optimize their advertising campaigns.
            Whether you're a small business owner or part of a large enterprise,
            we provide the tools you need to track performance, gain insights,
            and maximize the impact of your marketing strategies.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">What We Do:</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Unified Analytics</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Consolidate data from multiple ad platforms in one place.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Real-Time Insights</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Access up-to-date metrics to make informed decisions.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Scalable Solutions</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Designed to grow with your business and adapt to your needs.
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Why Choose Us?</h2>
          <p className="text-gray-500 dark:text-gray-400">
            With Advertising Analytics Dashboard, you can:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-500 dark:text-gray-400">
            <li>
              Save time by managing all your campaigns from a single interface.
            </li>
            <li>Gain a competitive edge with actionable insights.</li>
            <li>Focus on growth while we handle the data.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Our Vision</h2>
          <p className="text-gray-500 dark:text-gray-400">
            We aim to empower businesses with advanced analytics and intuitive
            tools that unlock the full potential of their advertising efforts.
            By bridging technology and marketing, we help you reach new heights.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Explore Services</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
