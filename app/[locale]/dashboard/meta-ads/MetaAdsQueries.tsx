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

export default function MetaAdsQueries() {
  const [formData, setFormData] = useState({
    queryName: "",
    adAccountId: "",
    accessToken: "",
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
        queryName: "Main Meta Ads Campaign",
        adAccountId: "1140105854207687",
        accessToken: "EAABsbCS1IPgBO...",
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
    if (
      !formData.adAccountId ||
      !formData.accessToken ||
      !startDate ||
      !endDate
    ) {
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
        reach: 876543,
        impressions: 1234567,
        clicks: 23456,
        ctr: "1.9%",
        spend: "$3,456.78",
        cpc: "$0.15",
        campaigns: [
          {
            name: "Brand Awareness",
            reach: 345678,
            impressions: 456789,
            spend: "$1,234.56",
          },
          {
            name: "Lead Generation",
            reach: 234567,
            impressions: 345678,
            spend: "$987.65",
          },
          {
            name: "Conversion",
            reach: 123456,
            impressions: 234567,
            spend: "$876.54",
          },
          {
            name: "Retargeting",
            reach: 98765,
            impressions: 123456,
            spend: "$765.43",
          },
          {
            name: "Lookalike",
            reach: 87654,
            impressions: 98765,
            spend: "$654.32",
          },
        ],
      });

      toast({
        title: "Analysis Complete",
        description: "Meta Ads data has been retrieved.",
      });
    }, 2000);
  };
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
          <CardDescription>
            Follow these steps to get your Ad Account ID and Access Token
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Go to Ads Manager</li>
            <li>
              Note your Ad account ID from the top left drop down (e.g.,
              1140105854207687 for Neil Mahajan Business &gt; Neil Mahajan Ad)
            </li>
            <li>Go to Business Settings</li>
            <li>
              Create an App under Accounts &gt; Apps &gt; Add &gt; Create a new
              app ID. Under Use Cases, select Other, then choose Business and
              click Create app
            </li>
            <li>
              Under 'Add products to your app', scroll down and select Marketing
              API &gt; Set Up
            </li>
            <li>
              Under 'Get Access Token', select ads_read and read_insights, then
              click Get Token
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
                    Main Meta Ads Campaign
                  </SelectItem>
                  <SelectItem value="previous-query-2">Q1 Campaign</SelectItem>
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
              <Label htmlFor="adAccountId">Ad Account ID</Label>
              <div className="flex gap-2">
                <Input
                  id="adAccountId"
                  name="adAccountId"
                  placeholder="Enter Ad Account ID"
                  value={formData.adAccountId}
                  onChange={handleChange}
                />
                <Button variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessToken">Access Token</Label>
              <div className="flex gap-2">
                <Input
                  id="accessToken"
                  name="accessToken"
                  type="password"
                  placeholder="Enter Access Token"
                  value={formData.accessToken}
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
            Meta Ads data for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!results && !isAnalyzing && (
            <div className="flex items-center justify-center h-[400px] bg-muted/20 rounded-md">
              <p className="text-muted-foreground">
                Enter your Ad Account ID, Access Token and date range, then
                click Analyze to see results
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center h-[400px] bg-muted/20 rounded-md">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-muted-foreground">
                Fetching Meta Ads data...
              </p>
            </div>
          )}

          {results && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/20 p-4 rounded-md">
                  <p className="text-sm text-muted-foreground">Reach</p>
                  <p className="text-2xl font-bold">
                    {results.reach.toLocaleString()}
                  </p>
                </div>
                <div className="bg-muted/20 p-4 rounded-md">
                  <p className="text-sm text-muted-foreground">Impressions</p>
                  <p className="text-2xl font-bold">
                    {results.impressions.toLocaleString()}
                  </p>
                </div>
                <div className="bg-muted/20 p-4 rounded-md">
                  <p className="text-sm text-muted-foreground">Clicks</p>
                  <p className="text-2xl font-bold">
                    {results.clicks.toLocaleString()}
                  </p>
                </div>
                <div className="bg-muted/20 p-4 rounded-md">
                  <p className="text-sm text-muted-foreground">CTR</p>
                  <p className="text-2xl font-bold">{results.ctr}</p>
                </div>
                <div className="bg-muted/20 p-4 rounded-md">
                  <p className="text-sm text-muted-foreground">Spend</p>
                  <p className="text-2xl font-bold">{results.spend}</p>
                </div>
                <div className="bg-muted/20 p-4 rounded-md">
                  <p className="text-sm text-muted-foreground">CPC</p>
                  <p className="text-2xl font-bold">{results.cpc}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Top Campaigns</h3>
                <div className="space-y-2">
                  {results.campaigns.map((campaign: any, index: number) => (
                    <div key={index} className="p-2 bg-muted/20 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{campaign.name}</span>
                        <span>{campaign.spend}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{campaign.reach.toLocaleString()} reach</span>
                        <span>
                          {campaign.impressions.toLocaleString()} impressions
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-[150px] bg-muted/20 rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">
                  Campaign performance chart will appear here
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
