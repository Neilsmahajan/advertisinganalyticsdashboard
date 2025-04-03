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
import { useSearchParams } from "next/navigation";
import TrackingDataResultsSection from "./TrackingDataResultsSection";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";

export default function TrackingDataQueries() {
  const t = useTranslations("TrackingDataQueries");
  const session = useSession();
  const [formData, setFormData] = useState({ queryName: "", websiteUrl: "" });
  const [selectedQuery, setSelectedQuery] = useState("new");
  const [savedQueries, setSavedQueries] = useState<
    { id: string; queryName: string; queryData: { websiteURL: string } }[]
  >([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const searchParams = useSearchParams();

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

  useEffect(() => {
    const sel = searchParams.get("selectedQuery");
    if (sel && sel !== "new" && savedQueries.length > 0) {
      const query = savedQueries.find((q) => q.id === sel);
      if (query) {
        setSelectedQuery(sel);
        setFormData({
          queryName: query.queryName,
          websiteUrl: query.queryData.websiteURL,
        });
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
      response = await fetch("/api/tracking-data/queries", {
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
    } else {
      toast({
        title: "Error",
        description: "Operation failed",
        variant: "destructive",
      });
    }
  };

  const handleAnalyze = async () => {
    if (!formData.queryName || !formData.websiteUrl) {
      toast({
        title: "Error",
        description: "Fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/tracking-data/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: formData.websiteUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        toast({
          title: "Analysis Complete",
          description: "Tracking data retrieved.",
        });
      } else {
        const error = await res.json();
        toast({
          title: "Error",
          description: error.error || "Operation failed",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Operation failed",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t("instructionsTitle")}</CardTitle>
          <CardDescription>{t("instructionsDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() =>
              window.open(
                "https://www.youtube.com/watch?v=YgKA8Xfb_D0",
                "_blank",
              )
            }
          >
            <PlayCircle className="h-4 w-4" /> {t("viewTutorial")}
          </Button>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>{t("previousQueries")}</Label>
              <Select value={selectedQuery} onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">{t("createNewQuery")}</SelectItem>
                  {savedQueries.map((q: any) => (
                    <SelectItem key={q.id} value={q.id}>
                      {q.queryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="queryName">{t("queryName")}</Label>
              <div className="flex gap-2">
                <Input
                  id="queryName"
                  name="queryName"
                  placeholder={t("queryNamePlaceholder")}
                  value={formData.queryName}
                  onChange={handleChange}
                />
                <Button variant="outline" onClick={handleSaveQuery}>
                  <Save className="h-4 w-4" /> {t("saveQuery")}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">{t("websiteUrl")}</Label>
              <Input
                id="websiteUrl"
                name="websiteUrl"
                placeholder={t("websiteUrlPlaceholder")}
                value={formData.websiteUrl}
                onChange={handleChange}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleAnalyze}
              disabled={
                isAnalyzing || !formData.queryName || !formData.websiteUrl
              }
            >
              {isAnalyzing ? t("analyzing") : t("analyze")}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t("resultsTitle")}</CardTitle>
          <CardDescription>{t("resultsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {!results && !isAnalyzing && (
            <div className="flex items-center justify-center h-[300px] bg-muted/20 rounded-md">
              <p className="text-muted-foreground">{t("noResults")}</p>
            </div>
          )}
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center h-[300px] bg-muted/20 rounded-md">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-muted-foreground">{t("analyzing")}</p>
            </div>
          )}
          {results && (
            <TrackingDataResultsSection
              results={results}
              userInfo={{
                name: session.data?.user.name ?? "",
                email: session.data?.user.email ?? "",
              }}
              queryInfo={{
                service: "Tracking Data",
                queryName: formData.queryName,
                queryData: { websiteURL: formData.websiteUrl },
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
