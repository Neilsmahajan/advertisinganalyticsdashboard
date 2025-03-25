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

export default function MetaAdsQueries() {
  const [formData, setFormData] = useState({
    queryName: "",
    adAccountId: "",
    accessToken: "",
  });
  const [selectedQuery, setSelectedQuery] = useState("new");
  const [savedQueries, setSavedQueries] = useState<
    {
      id: string;
      queryName: string;
      queryData: {
        adAccountId: number;
        accessToken: string;
        startDate: string;
        endDate: string;
      };
    }[]
  >([]);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<null | any>(null);
  const searchParams = useSearchParams();

  // Load saved Meta Ads queries on mount
  useEffect(() => {
    async function loadQueries() {
      const res = await fetch("/api/meta-ads/queries");
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
          adAccountId: query.queryData.adAccountId.toString(),
          accessToken: query.queryData.accessToken,
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
          adAccountId: query.queryData.adAccountId.toString(),
          accessToken: query.queryData.accessToken,
        });
        setStartDate(new Date(query.queryData.startDate));
        setEndDate(new Date(query.queryData.endDate));
      }
    } else {
      setFormData({ queryName: "", adAccountId: "", accessToken: "" });
      setStartDate(undefined);
      setEndDate(undefined);
    }
  };

  const refreshQueries = async () => {
    const res = await fetch("/api/meta-ads/queries");
    if (res.ok) {
      const data = await res.json();
      setSavedQueries(data.queries || []);
    }
  };

  const handleSaveQuery = async () => {
    if (
      !formData.queryName ||
      !formData.adAccountId ||
      !formData.accessToken ||
      !startDate ||
      !endDate
    ) {
      toast({
        title: "Error",
        description: "Fill in all fields",
        variant: "destructive",
      });
      return;
    }
    const payload = {
      service: "Meta Ads",
      queryName: formData.queryName,
      queryData: {
        adAccountId: parseInt(formData.adAccountId),
        accessToken: formData.accessToken,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    };

    let response;
    if (selectedQuery === "new") {
      response = await fetch("/api/meta-ads/queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      response = await fetch("/api/meta-ads/queries", {
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
      // Leave formData unchanged so fields remain visible.
    } else {
      toast({
        title: "Error",
        description: "Operation failed",
        variant: "destructive",
      });
    }
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
        description: "Fill in all required fields",
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
            Enter your Ad Account ID, Access Token, select your date range and
            create or select an existing query.
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
              <Label htmlFor="adAccountId">Ad Account ID</Label>
              <Input
                id="adAccountId"
                name="adAccountId"
                placeholder="Enter Ad Account ID"
                value={formData.adAccountId}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accessToken">Access Token</Label>
              <Input
                id="accessToken"
                name="accessToken"
                placeholder="Enter Access Token"
                type="password"
                value={formData.accessToken}
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
              {/* Render results as needed */}
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
