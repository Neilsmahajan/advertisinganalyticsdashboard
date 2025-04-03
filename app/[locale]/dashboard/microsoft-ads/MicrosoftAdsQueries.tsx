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
import { useSession, signIn, signOut } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import MicrosoftAdsResultsSection from "./MicrosoftAdsResultsSection";

export default function MicrosoftAdsQueries() {
  const t = useTranslations("MicrosoftAdsQueries");
  const { data: session } = useSession();
  const locale = useLocale();
  const [formData, setFormData] = useState({
    queryName: "",
    accountId: "",
    customerId: "",
  });
  const [selectedQuery, setSelectedQuery] = useState("new");
  const [savedQueries, setSavedQueries] = useState<
    {
      id: string;
      queryName: string;
      queryData: {
        accountId: number;
        customerId: number;
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

  // Disconnect handler for Microsoft account
  const handleDisconnectMicrosoft = async () => {
    try {
      const res = await fetch("/api/auth/disconnect/microsoft-entra-id", {
        method: "POST",
      });
      if (res.ok) {
        toast({
          title: t("disconnectSuccessTitle"),
          description: t("disconnectSuccessDescription"),
        });
        location.reload();
      } else {
        toast({
          title: t("disconnectErrorTitle"),
          description: t("disconnectErrorDescription"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: t("disconnectErrorTitle"),
        description: t("disconnectErrorDescription"),
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    async function loadQueries() {
      const res = await fetch("/api/microsoft-ads/queries");
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
          accountId: query.queryData.accountId.toString(),
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
          accountId: query.queryData.accountId.toString(),
          customerId: query.queryData.customerId.toString(),
        });
        setStartDate(new Date(query.queryData.startDate));
        setEndDate(new Date(query.queryData.endDate));
      }
    } else {
      setFormData({ queryName: "", accountId: "", customerId: "" });
      setStartDate(undefined);
      setEndDate(undefined);
    }
  };

  const refreshQueries = async () => {
    const res = await fetch("/api/microsoft-ads/queries");
    if (res.ok) {
      const data = await res.json();
      setSavedQueries(data.queries || []);
    }
  };

  const handleSaveQuery = async () => {
    if (
      !formData.queryName ||
      !formData.accountId ||
      !formData.customerId ||
      !startDate ||
      !endDate
    ) {
      toast({
        title: t("saveErrorTitle"),
        description: t("saveErrorDescription"),
        variant: "destructive",
      });
      return;
    }
    const payload = {
      service: "Microsoft Ads",
      queryName: formData.queryName,
      queryData: {
        accountId: parseInt(formData.accountId),
        customerId: parseInt(formData.customerId),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    };

    let response;
    if (selectedQuery === "new") {
      response = await fetch("/api/microsoft-ads/queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      response = await fetch("/api/microsoft-ads/queries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedQuery, ...payload }),
      });
    }

    if (response.ok) {
      const result = await response.json();
      const savedQuery = result.query;
      toast({
        title: t("saveSuccessTitle"),
        description:
          selectedQuery === "new"
            ? t("saveSuccessDescriptionNew", { queryName: formData.queryName })
            : t("saveSuccessDescriptionUpdate", {
                queryName: formData.queryName,
              }),
      });
      refreshQueries();
      setSelectedQuery(savedQuery.id);
    } else {
      toast({
        title: t("saveErrorTitle"),
        description: t("saveErrorDescription"),
        variant: "destructive",
      });
    }
  };

  const handleAnalyze = async () => {
    if (!formData.accountId || !formData.customerId || !startDate || !endDate) {
      toast({
        title: t("analyzeErrorTitle"),
        description: t("analyzeErrorDescription"),
        variant: "destructive",
      });
      return;
    }
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/microsoft-ads/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: formData.accountId,
          customerId: formData.customerId,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        toast({
          title: t("analyzeErrorTitle"),
          description: error.error || t("analyzeErrorDescription"),
          variant: "destructive",
        });
      } else {
        const data = await res.json();
        setResults(data);
        toast({
          title: t("analyzeSuccessTitle"),
          description: t("analyzeSuccessDescription"),
        });
      }
    } catch (err) {
      toast({
        title: t("analyzeErrorTitle"),
        description: t("analyzeErrorDescription"),
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
          {!session?.microsoft?.accessToken ? (
            <>
              <CardDescription>{t("connectDescription")}</CardDescription>
              <Button
                variant="outline"
                onClick={() =>
                  signIn("microsoft-entra-id", {
                    callbackUrl: `/${locale}/dashboard/microsoft-ads`,
                  })
                }
                className="mt-4"
              >
                {t("connectButton")}
              </Button>
            </>
          ) : (
            <>
              <CardDescription>{t("queryDescription")}</CardDescription>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={handleDisconnectMicrosoft}>
                  {t("disconnectButton")}
                </Button>
              </div>
            </>
          )}
        </CardHeader>
        {session?.microsoft?.accessToken && (
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() =>
                window.open(
                  "https://www.youtube.com/watch?v=uVBtIBnIXoY",
                  "_blank",
                )
              }
            >
              <PlayCircle className="h-4 w-4" /> {t("viewTutorial")}
            </Button>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t("previousQueriesLabel")}</Label>
                <Select
                  value={selectedQuery}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectQueryPlaceholder")} />
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
                <Label htmlFor="queryName">{t("queryNameLabel")}</Label>
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
                <Label htmlFor="accountId">{t("accountIdLabel")}</Label>
                <Input
                  id="accountId"
                  name="accountId"
                  placeholder={t("accountIdPlaceholder")}
                  value={formData.accountId}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerId">{t("customerIdLabel")}</Label>
                <Input
                  id="customerId"
                  name="customerId"
                  placeholder={t("customerIdPlaceholder")}
                  value={formData.customerId}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("startDateLabel")}</Label>
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
                  <Label>{t("endDateLabel")}</Label>
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
                  isAnalyzing ||
                  !formData.accountId ||
                  !formData.customerId ||
                  !startDate ||
                  !endDate
                }
              >
                {isAnalyzing ? t("analyzingButton") : t("analyzeButton")}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t("resultsTitle")}</CardTitle>
          <CardDescription>{t("resultsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {!results && !isAnalyzing && (
            <div className="flex items-center justify-center h-[400px] bg-muted/20 rounded-md">
              <p className="text-muted-foreground">
                {t("noResultsDescription")}
              </p>
            </div>
          )}
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center h-[400px] bg-muted/20 rounded-md">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-muted-foreground">
                {t("fetchingDataDescription")}
              </p>
            </div>
          )}
          {results && (
            <MicrosoftAdsResultsSection
              results={results}
              queryInfo={{
                service: "Microsoft Ads",
                queryName: formData.queryName,
                queryData: {
                  accountId: formData.accountId,
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
