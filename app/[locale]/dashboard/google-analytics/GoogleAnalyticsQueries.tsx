"use client";
import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, PlayCircle, Save, Eye } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

export default function GoogleAnalyticsQueries() {
  const [formData, setFormData] = useState({
    queryName: "",
    propertyId: "",
  });
  const [selectedQuery, setSelectedQuery] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<null | any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setSelectedQuery(value);
    // In a real app, you would load the saved query data here
    if (value === "previous-query-1") {
      setFormData({
        queryName: "Main Website Analytics",
        propertyId: "469573948",
      });
      setStartDate(new Date(2023, 0, 1));
      setEndDate(new Date(2023, 0, 31));
    }
  };

  const handleSaveQuery = () => {
    if (!formData.queryName) {
      toast({
        title: "Error",
        description: "Please enter a query name",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Query Saved",
      description: `Query "${formData.queryName}" has been saved.`,
    });
  };

  const handleAnalyze = () => {
    if (!formData.propertyId || !startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    // Simulate API call
    setTimeout(() => {
      setIsAnalyzing(false);
      setResults({
        users: 12453,
        newUsers: 8765,
        sessions: 23456,
        bounceRate: "45.2%",
        avgSessionDuration: "2m 34s",
        topPages: [
          { path: "/", pageviews: 12345 },
          { path: "/products", pageviews: 5432 },
          { path: "/about", pageviews: 3456 },
          { path: "/contact", pageviews: 2345 },
          { path: "/blog", pageviews: 1234 },
        ],
      });

      toast({
        title: "Analysis Complete",
        description: "Google Analytics data has been retrieved.",
      });
    }, 2000);
  };
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
          <CardDescription>
            Follow these steps to use this application with your Google
            Analytics data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Go to your Google Analytics Dashboard.</li>
            <li>
              Navigate to Admin &gt; Account &gt; Account access management
            </li>
            <li>
              Add the following email:
              google-analytics@advertisinganalytics-dashboard.iam.gserviceaccount.com
            </li>
            <li>Grant Viewer role access.</li>
            <li>
              Get your Google Analytics Property ID (e.g., 469573948) from Admin
              &gt; Property &gt; Property details.
            </li>
            <li>
              Enter the Property ID below, along with the desired date range,
              and click Get Analytics.
            </li>
          </ol>

          <Button variant="outline" className="gap-2 mt-4">
            <PlayCircle className="h-4 w-4" /> View Tutorial
          </Button>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Previous Queries</Label>
              <Select value={selectedQuery} onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a previous query or create new" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Create New Query</SelectItem>
                  <SelectItem value="previous-query-1">
                    Main Website Analytics
                  </SelectItem>
                  <SelectItem value="previous-query-2">
                    Blog Analytics
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="queryName">Query Name</Label>
              <div className="flex gap-2">
                <Input
                  id="queryName"
                  name="queryName"
                  placeholder="Enter query name"
                  value={formData.queryName}
                  onChange={handleChange}
                />
                <Button variant="outline" onClick={handleSaveQuery}>
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyId">Property ID</Label>
              <div className="flex gap-2">
                <Input
                  id="propertyId"
                  name="propertyId"
                  placeholder="Enter Property ID"
                  value={formData.propertyId}
                  onChange={handleChange}
                />
                <Button variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>
            Google Analytics data for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!results && !isAnalyzing && (
            <div className="flex items-center justify-center h-[400px] bg-muted/20 rounded-md">
              <p className="text-muted-foreground">
                Enter your Property ID and date range, then click Analyze to see
                results
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center h-[400px] bg-muted/20 rounded-md">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-muted-foreground">
                Fetching Google Analytics data...
              </p>
            </div>
          )}

          {results && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/20 p-4 rounded-md">
                  <p className="text-sm text-muted-foreground">Users</p>
                  <p className="text-2xl font-bold">
                    {results.users.toLocaleString()}
                  </p>
                </div>
                <div className="bg-muted/20 p-4 rounded-md">
                  <p className="text-sm text-muted-foreground">New Users</p>
                  <p className="text-2xl font-bold">
                    {results.newUsers.toLocaleString()}
                  </p>
                </div>
                <div className="bg-muted/20 p-4 rounded-md">
                  <p className="text-sm text-muted-foreground">Sessions</p>
                  <p className="text-2xl font-bold">
                    {results.sessions.toLocaleString()}
                  </p>
                </div>
                <div className="bg-muted/20 p-4 rounded-md">
                  <p className="text-sm text-muted-foreground">Bounce Rate</p>
                  <p className="text-2xl font-bold">{results.bounceRate}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Top Pages</h3>
                <div className="space-y-2">
                  {results.topPages.map((page: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-muted/20 rounded-md"
                    >
                      <span>{page.path}</span>
                      <span className="font-medium">
                        {page.pageviews.toLocaleString()} views
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-[200px] bg-muted/20 rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">
                  Traffic chart will appear here
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
