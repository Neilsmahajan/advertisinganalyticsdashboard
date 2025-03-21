import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  BarChart3,
  LineChart,
  PieChart,
  BarChart,
  Megaphone,
  Mail,
} from "lucide-react";
import SignOutButton from "./SignOutButton";

export default function AccountPage() {
  return (
    <div className="container px-4 py-12 md:px-6 md:py-20">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            MY ACCOUNT
          </h1>
          <p className="text-gray-500 dark:text-gray-400 md:text-lg">
            Welcome, Neil Mahajan!
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your profile information and saved queries here.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Name:
                </p>
                <p className="font-medium">Neil Mahajan</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Email:
                </p>
                <p className="font-medium">neilsmahajan@gmail.com</p>
              </div>
              <SignOutButton />
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Saved Queries</CardTitle>
              <CardDescription>
                Access your saved queries for different services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tracking">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
                  <TabsTrigger value="tracking">Tracking</TabsTrigger>
                  <TabsTrigger value="google">Google</TabsTrigger>
                  <TabsTrigger value="meta">Meta</TabsTrigger>
                  <TabsTrigger value="other">Other</TabsTrigger>
                </TabsList>
                <TabsContent value="tracking" className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center">
                      <Search className="h-5 w-5 text-primary mr-2" />
                      <span>Tracking Data</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="google" className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center">
                      <BarChart3 className="h-5 w-5 text-primary mr-2" />
                      <span>Google Analytics</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center">
                      <LineChart className="h-5 w-5 text-primary mr-2" />
                      <span>Google Ads</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="meta" className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center">
                      <PieChart className="h-5 w-5 text-primary mr-2" />
                      <span>Meta Ads</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="other" className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center">
                      <BarChart className="h-5 w-5 text-primary mr-2" />
                      <span>Microsoft Ads</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center">
                      <Megaphone className="h-5 w-5 text-primary mr-2" />
                      <span>X Ads</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-primary mr-2" />
                      <span>Mailchimp</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
