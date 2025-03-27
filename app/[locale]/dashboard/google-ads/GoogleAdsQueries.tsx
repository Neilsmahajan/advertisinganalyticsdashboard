"use client";
import React, { useEffect, useState } from "react";
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
import { useSearchParams } from "next/navigation";

export default function GoogleAdsQueries() {
  const [formData, setFormData] = useState({ queryName: "", customerId: "" });
  const [selectedQuery, setSelectedQuery] = useState("new");
  const [savedQueries, setSavedQueries] = useState<
    {
      id: string;
      queryName: string;
      queryData: { customerId: number; startDate: string; endDate: string };
    }[]
  >([]);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<null | any>(null);
  const searchParams = useSearchParams();

  // Load saved queries via API on mount
  useEffect(() => {
    async function loadQueries() {
      const res = await fetch("/api/google-ads/queries");
      if (res.ok) {
        const data = await res.json();
        setSavedQueries(data.queries || []);
      }
    }
    loadQueries();
  }, []);

  useEffect(() => {
    const sel = searchParams.get("selectedQuery");
    if (sel && sel !== "new" && savedQueries.length > 0) {
      const query = savedQueries.find((q) => q.id === sel);
      if (query) {
        setSelectedQuery(sel);
        setFormData({
          queryName: query.queryName,
          customerId: query.queryData.customerId.toString(),
        });
        setStartDate(new Date(query.queryData.startDate));
        setEndDate(new Date(query.queryData.endDate));
      }
    }
  }, [savedQueries, searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setSelectedQuery(value);
    if (value !== "new") {
      const query = savedQueries.find((q) => q.id === value);
      if (query) {
        setFormData({
          queryName: query.queryName,
          customerId: query.queryData.customerId.toString(),
        });
        setStartDate(new Date(query.queryData.startDate));
        setEndDate(new Date(query.queryData.endDate));
      }
    } else {
      setFormData({ queryName: "", customerId: "" });
      setStartDate(undefined);
      setEndDate(undefined);
    }
  };

  const refreshQueries = async () => {
    const res = await fetch("/api/google-ads/queries");
    if (res.ok) {
      const data = await res.json();
      setSavedQueries(data.queries || []);
    }
  };

  const handleSaveQuery = async () => {
    if (!formData.queryName || !formData.customerId || !startDate || !endDate) {
      toast({
        title: "Error",
        description: "Fill in all fields",
        variant: "destructive",
      });
      return;
    }
    const payload = {
      service: "Google Ads",
      queryName: formData.queryName,
      queryData: {
        customerId: parseInt(formData.customerId),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    };

    let response;
    if (selectedQuery === "new") {
      response = await fetch("/api/google-ads/queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      response = await fetch("/api/google-ads/queries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedQuery, ...payload }),
      });
    }

    if (response.ok) {
      const result = await response.json();
      const savedQuery = result.query;
      toast({
        title: "Success",
        description:
          selectedQuery === "new"
            ? `New query "${formData.queryName}" saved.`
            : `Query "${formData.queryName}" updated.`,
      });
      refreshQueries();
      setSelectedQuery(savedQuery.id);
      // Leave formData intact so the fields remain visible.
    } else {
      toast({
        title: "Error",
        description: "Operation failed",
        variant: "destructive",
      });
    }
  };

  const handleAnalyze = () => {
    if (!formData.customerId || !startDate || !endDate) {
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
        impressions: 543210,
        clicks: 12345,
        ctr: "2.27%",
        cost: "$4,321.50",
        conversions: 543,
        costPerConversion: "$7.96",
        campaigns: [
          {
            name: "Brand Awareness",
            impressions: 123456,
            clicks: 3456,
            cost: "$1,234.56",
          },
          {
            name: "Retargeting",
            impressions: 98765,
            clicks: 2345,
            cost: "$987.65",
          },
          {
            name: "Product Launch",
            impressions: 87654,
            clicks: 1234,
            cost: "$876.54",
          },
          {
            name: "Holiday Special",
            impressions: 76543,
            clicks: 987,
            cost: "$765.43",
          },
          {
            name: "Competitor Keywords",
            impressions: 65432,
            clicks: 876,
            cost: "$654.32",
          },
        ],
      });
      toast({
        title: "Analysis Complete",
        description: "Google Ads data has been retrieved.",
      });
    }, 2000);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
          <CardDescription>
            Enter your Customer ID, select your date range, and create or select
            an existing query.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="gap-2">
            <PlayCircle className="h-4 w-4" /> View Tutorial
          </Button>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Previous Queries</Label>
              <Select value={selectedQuery} onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a saved query or create new" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Create New Query</SelectItem>
                  {savedQueries.map((q) => (
                    <SelectItem key={q.id} value={q.id}>
                      {q.queryName}
                    </SelectItem>
                  ))}
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
              <Label htmlFor="customerId">Customer ID</Label>
              <Input
                id="customerId"
                name="customerId"
                placeholder="Enter Customer ID"
                value={formData.customerId}
                onChange={handleChange}
              />
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
              disabled={
                isAnalyzing || !formData.customerId || !startDate || !endDate
              }
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
            Google Ads data for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!results && !isAnalyzing && (
            <div className="flex items-center justify-center h-[400px] bg-muted/20 rounded-md">
              <p className="text-muted-foreground">
                Enter your Customer ID and date range, then click Analyze to see
                results
              </p>
            </div>
          )}
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center h-[400px] bg-muted/20 rounded-md">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-muted-foreground">
                Fetching Google Ads data...
              </p>
            </div>
          )}
          {results && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
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
              </div>
              <div>
                <h3 className="font-medium mb-2">Top Campaigns</h3>
                <div className="space-y-2">
                  {results.campaigns.map((campaign: any, index: number) => (
                    <div key={index} className="p-2 bg-muted/20 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{campaign.name}</span>
                        <span>{campaign.cost}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>
                          {campaign.impressions.toLocaleString()} impressions
                        </span>
                        <span>{campaign.clicks.toLocaleString()} clicks</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
