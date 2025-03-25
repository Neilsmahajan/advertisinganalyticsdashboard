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
import { PlayCircle, Save } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function TrackingDataQueries() {
  const [formData, setFormData] = useState({ queryName: "", websiteUrl: "" });
  const [selectedQuery, setSelectedQuery] = useState("new");
  const [savedQueries, setSavedQueries] = useState<
    { id: string; queryName: string; queryData: { websiteURL: string } }[]
  >([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  // Load saved queries via API on mount
  useEffect(() => {
    async function loadQueries() {
      const res = await fetch("/api/tracking-data/queries");
      if (res.ok) {
        const data = await res.json();
        setSavedQueries(data.queries || []);
      }
    }
    loadQueries();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setSelectedQuery(value);
    // If an existing query is selected, load its data into form
    if (value !== "new") {
      const query = savedQueries.find((q: any) => q.id === value);
      if (query) {
        setFormData({
          queryName: query.queryName,
          websiteUrl: query.queryData.websiteURL,
        });
      }
    } else {
      setFormData({ queryName: "", websiteUrl: "" });
    }
  };

  const refreshQueries = async () => {
    const res = await fetch("/api/tracking-data/queries");
    if (res.ok) {
      const data = await res.json();
      setSavedQueries(data.queries || []);
    }
  };

  const handleSaveQuery = async () => {
    if (!formData.queryName) {
      toast({
        title: "Error",
        description: "Please enter a query name",
        variant: "destructive",
      });
      return;
    }

    // Build payload (adjust the shape to your prisma schema)
    const payload = {
      service: "Tracking Data",
      queryName: formData.queryName,
      queryData: { websiteURL: formData.websiteUrl },
    };

    let response;
    if (selectedQuery === "new") {
      response = await fetch("/api/tracking-data/queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      // Update existing query. Assume id available in selectedQuery.
      response = await fetch("/api/tracking-data/queries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedQuery, ...payload }),
      });
    }

    if (response.ok) {
      toast({
        title: "Success",
        description:
          selectedQuery === "new"
            ? `New query "${formData.queryName}" saved.`
            : `Query "${formData.queryName}" updated.`,
      });
      refreshQueries();
      setSelectedQuery("new");
      setFormData({ queryName: "", websiteUrl: "" });
    } else {
      toast({
        title: "Error",
        description: "Operation failed",
        variant: "destructive",
      });
    }
  };

  const handleAnalyze = () => {
    // if (!formData.websiteUrl) {
    //   toast({ title: "Error", description: "Please enter a website URL", variant: "destructive" });
    //   return;
    // }
    // setIsAnalyzing(true);
    // setTimeout(() => {
    //   setIsAnalyzing(false);
    //   setResults({ found: ["Google Analytics (GA4)", "Google Tag Manager", "Facebook Pixel", "LinkedIn Insight Tag", "HotJar"] });
    //   toast({ title: "Analysis Complete", description: "We've found tracking services on this website." });
    // }, 2000);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
          <CardDescription>
            Enter your website URL and select from your saved queries or create
            one.
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
                  {savedQueries.map((q: any) => (
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
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                name="websiteUrl"
                placeholder="Enter Website URL"
                value={formData.websiteUrl}
                onChange={handleChange}
              />
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
            Tracking services found on your website
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!results && !isAnalyzing && (
            <div className="flex items-center justify-center h-[300px] bg-muted/20 rounded-md">
              <p className="text-muted-foreground">
                Enter a URL and click Analyze to see results
              </p>
            </div>
          )}
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center h-[300px] bg-muted/20 rounded-md">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-muted-foreground">Analyzing website…</p>
            </div>
          )}
          {results && (
            <div className="space-y-4">
              {/* <p className="font-medium">Found {results.found.length} tracking services:</p>
                <ul className="space-y-2">
                  {results.found.map((service: string, index: number) => (
                    <li key={index} className="flex items-center p-2 bg-muted/20 rounded-md">
                      <span className="h-2 w-2 bg-primary rounded-full mr-2"></span>
                      {service}
                    </li>
                  ))}
                </ul> */}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
