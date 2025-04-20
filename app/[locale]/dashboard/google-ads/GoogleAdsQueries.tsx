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
import GoogleAdsResultsSection from "./GoogleAdsResultsSection";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";

export default function GoogleAdsQueries() {
  const t = useTranslations("GoogleAdsQueries");
  const session = useSession();
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
  const [accountStatus, setAccountStatus] = useState<any>(null);
  const [isCheckingAccount, setIsCheckingAccount] = useState(false);
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

    if (name === "customerId") {
      // Remove all non-numeric characters
      const numericValue = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
        title: t("saveQueryErrorTitle"),
        description: t("fillFields"),
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
        title: t("saveQuerySuccessTitle"),
        description:
          selectedQuery === "new" ? t("newQuerySaved") : t("queryUpdated"),
      });
      refreshQueries();
      setSelectedQuery(savedQuery.id);
      // Leave formData intact so the fields remain visible.
    } else {
      toast({
        title: t("errorTitle"),
        description: t("operationFailed"),
        variant: "destructive",
      });
    }
  };

  const handleAnalyze = async () => {
    if (!formData.customerId || !startDate || !endDate) {
      toast({
        title: t("errorTitle"),
        description: t("fillRequiredFields"),
        variant: "destructive",
      });
      return;
    }

    // Validate that customerId has exactly 10 digits
    if (formData.customerId.length !== 10) {
      toast({
        title: t("errorTitle"),
        description:
          t("customerIdInvalid") || "Customer ID must be exactly 10 digits",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/google-ads/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: formData.customerId,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        toast({
          title: t("errorTitle"),
          description: error.error || t("operationFailed"),
          variant: "destructive",
        });
      } else {
        const data = await res.json();
        setResults(data);
        toast({
          title: t("analysisCompleteTitle"),
          description: t("adsDataRetrieved"),
        });
      }
    } catch (err) {
      toast({
        title: t("errorTitle"),
        description: t("operationFailed"),
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const checkGoogleAccount = async () => {
    setIsCheckingAccount(true);
    try {
      const res = await fetch("/api/google-ads/check-account");
      const data = await res.json();
      setAccountStatus(data);

      if (data.status !== "success") {
        toast({
          title: "Account Status",
          description: data.message,
          variant: data.status === "error" ? "destructive" : "default",
        });
      } else {
        toast({
          title: "Account Status",
          description: data.message,
        });
      }
    } catch (err) {
      toast({
        title: t("errorTitle"),
        description: t("operationFailed"),
        variant: "destructive",
      });
    } finally {
      setIsCheckingAccount(false);
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
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() =>
                window.open(
                  "https://www.youtube.com/watch?v=KJ0mmCF742Y",
                  "_blank",
                )
              }
            >
              <PlayCircle className="h-4 w-4" /> {t("viewTutorial")}
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={checkGoogleAccount}
              disabled={isCheckingAccount}
            >
              <Eye className="h-4 w-4" />{" "}
              {isCheckingAccount ? "Checking..." : "Check Account Status"}
            </Button>
          </div>
          {accountStatus && (
            <div
              className={`text-sm p-2 rounded ${
                accountStatus.status === "success"
                  ? "bg-green-100 text-green-800"
                  : accountStatus.status === "warning"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }`}
            >
              {accountStatus.message}
              {accountStatus.scope && (
                <div className="mt-1 text-xs overflow-hidden text-ellipsis">
                  Scopes: {accountStatus.scope}
                </div>
              )}
            </div>
          )}

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
              <Label htmlFor="customerId">{t("customerId")}</Label>
              <Input
                id="customerId"
                name="customerId"
                placeholder={t("customerIdPlaceholder")}
                value={formData.customerId}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">
                {formData.customerId && formData.customerId.length !== 10
                  ? t("customerIdLengthNote") ||
                    "Customer ID must be exactly 10 digits"
                  : t("customerIdNote") ||
                    "Dashes and other non-numeric characters will be automatically removed"}
              </p>
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
                isAnalyzing || !formData.customerId || !startDate || !endDate
              }
            >
              {isAnalyzing ? t("analyzing") : t("analyze")}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t("results")}</CardTitle>
          <CardDescription>{t("resultsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {!results && !isAnalyzing && (
            <div className="flex items-center justify-center h-[400px] bg-muted/20 rounded-md">
              <p className="text-muted-foreground">{t("noResults")}</p>
            </div>
          )}
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center h-[400px] bg-muted/20 rounded-md">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-muted-foreground">{t("analyzing")}</p>
            </div>
          )}
          {results && (
            <GoogleAdsResultsSection
              results={results}
              userInfo={{
                name: session.data?.user.name ?? "",
                email: session.data?.user.email ?? "",
              }}
              queryInfo={{
                service: "Google Ads",
                queryName: formData.queryName,
                queryData: {
                  customerId: formData.customerId,
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
