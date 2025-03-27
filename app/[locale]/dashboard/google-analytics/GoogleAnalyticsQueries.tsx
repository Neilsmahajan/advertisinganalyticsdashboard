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
import { useTranslations } from "next-intl";
import GoogleAnalyticsResultsSection from "./GoogleAnalyticsResultsSection"; // new import

export default function GoogleAnalyticsQueries() {
  const t = useTranslations("GoogleAnalyticsQueries");
  const [formData, setFormData] = useState({ queryName: "", propertyId: "" });
  const [selectedQuery, setSelectedQuery] = useState("new");
  const [savedQueries, setSavedQueries] = useState<
    {
      id: string;
      queryName: string;
      queryData: { propertyId: number; startDate: string; endDate: string };
    }[]
  >([]);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const searchParams = useSearchParams();

  // Load saved GA queries on mount
  useEffect(() => {
    async function loadQueries() {
      const res = await fetch("/api/google-analytics/queries");
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
          propertyId: query.queryData.propertyId.toString(),
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
          propertyId: query.queryData.propertyId.toString(),
        });
        setStartDate(new Date(query.queryData.startDate));
        setEndDate(new Date(query.queryData.endDate));
      }
    } else {
      setFormData({ queryName: "", propertyId: "" });
      setStartDate(undefined);
      setEndDate(undefined);
    }
  };

  const refreshQueries = async () => {
    const res = await fetch("/api/google-analytics/queries");
    if (res.ok) {
      const data = await res.json();
      setSavedQueries(data.queries || []);
    }
  };

  const handleSaveQuery = async () => {
    if (!formData.queryName || !formData.propertyId || !startDate || !endDate) {
      toast({
        title: "Error",
        description: "Fill in all fields",
        variant: "destructive",
      });
      return;
    }
    const payload = {
      service: "Google Analytics",
      queryName: formData.queryName,
      queryData: {
        propertyId: parseInt(formData.propertyId),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    };

    let response;
    if (selectedQuery === "new") {
      response = await fetch("/api/google-analytics/queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      response = await fetch("/api/google-analytics/queries", {
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
      // Leave formData unchanged so the fields remain visible.
    } else {
      toast({
        title: "Error",
        description: "Operation failed",
        variant: "destructive",
      });
    }
  };

  const handleAnalyze = async () => {
    if (!formData.propertyId || !startDate || !endDate) {
      toast({
        title: "Error",
        description: "Fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/google-analytics/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: formData.propertyId,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        toast({
          title: "Error",
          description: error.error || "Operation failed",
          variant: "destructive",
        });
      } else {
        const data = await res.json();
        setResults(data);
        toast({
          title: "Analysis Complete",
          description: "Google Analytics data retrieved.",
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
          <Button variant="outline" className="gap-2">
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
                  {savedQueries.map((q) => (
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
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="propertyId">{t("propertyId")}</Label>
              <Input
                id="propertyId"
                name="propertyId"
                placeholder={t("propertyIdPlaceholder")}
                value={formData.propertyId}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("startDate")}</Label>
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
                      {startDate ? format(startDate, "PPP") : t("pickDate")}
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
                <Label>{t("endDate")}</Label>
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
                      {endDate ? format(endDate, "PPP") : t("pickDate")}
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
                isAnalyzing || !formData.propertyId || !startDate || !endDate
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
            <GoogleAnalyticsResultsSection
              results={results}
              userInfo={{ name: "John Doe", email: "john@example.com" }}
              queryInfo={{
                service: "Google Analytics",
                queryName: formData.queryName,
                queryData: {
                  propertyId: formData.propertyId,
                  startDate,
                  endDate,
                },
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
