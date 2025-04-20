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
import {
  CalendarIcon,
  PlayCircle,
  Save,
  Eye,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import MetaAdsResultsSection from "./MetaAdsResultsSection";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";

export default function MetaAdsQueries() {
  const [formData, setFormData] = useState({
    queryName: "",
    adAccountId: "",
  });
  const [selectedQuery, setSelectedQuery] = useState("new");
  const [savedQueries, setSavedQueries] = useState<
    {
      id: string;
      queryName: string;
      queryData: {
        adAccountId: number;
        startDate: string;
        endDate: string;
      };
    }[]
  >([]);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<null | any>(null);
  const [accountStatus, setAccountStatus] = useState<any>(null);
  const [isCheckingAccount, setIsCheckingAccount] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const t = useTranslations("MetaAdsQueries");
  const locale = useLocale();

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
        });
        setStartDate(new Date(query.queryData.startDate));
        setEndDate(new Date(query.queryData.endDate));
      }
    } else {
      setFormData({ queryName: "", adAccountId: "" });
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
      !startDate ||
      !endDate
    ) {
      toast({
        title: "Error",
        description: t("fillRequiredFields"),
        variant: "destructive",
      });
      return;
    }
    const payload = {
      service: "Meta Ads",
      queryName: formData.queryName,
      queryData: {
        adAccountId: parseInt(formData.adAccountId),
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
    } else {
      toast({
        title: "Error",
        description: t("operationFailed"),
        variant: "destructive",
      });
    }
  };

  const handleAnalyze = async () => {
    if (!formData.adAccountId || !startDate || !endDate) {
      toast({
        title: t("errorTitle"),
        description: t("fillRequiredFields"),
        variant: "destructive",
      });
      return;
    }
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const res = await fetch("/api/meta-ads/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adAccountId: formData.adAccountId,
          accessToken: session?.facebook?.accessToken,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAnalysisError(data.error || t("operationFailed"));
        toast({
          title: t("errorTitle"),
          description: data.error || t("operationFailed"),
          variant: "destructive",
        });
      } else {
        setResults(data);
        toast({
          title: t("analysisCompleteTitle"),
          description: t("adsDataRetrieved"),
        });
      }
    } catch (err) {
      setAnalysisError(t("operationFailed"));
      toast({
        title: t("errorTitle"),
        description: t("operationFailed"),
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Disconnect handler for Facebook (Meta)
  const handleDisconnectFacebook = async () => {
    try {
      const res = await fetch("/api/auth/disconnect/facebook", {
        method: "POST",
      });
      if (res.ok) {
        toast({
          title: "Disconnected",
          description: "Meta account disconnected successfully.",
        });
        location.reload();
      } else {
        toast({
          title: "Error",
          description: "Could not disconnect Meta account.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An error occurred during disconnect.",
        variant: "destructive",
      });
    }
  };

  // Handle sign in to reconnect with permissions
  const handleSignInWithPermissions = () => {
    signIn("facebook", {
      callbackUrl: `/${locale}/dashboard/meta-ads`,
    });
  };

  const checkMetaAccount = async () => {
    setIsCheckingAccount(true);
    setAnalysisError(null);

    // First, do a fast check that skips the slow API call
    try {
      const res = await fetch("/api/meta-ads/check-account?skipSlowCheck=true");
      const data = await res.json();
      setAccountStatus(data);

      if (data.status === "pending") {
        // We got back the basic permission check, now start a background check for full access
        toast({
          title: "Initial Check Complete",
          description: "Checking Meta Ads API access in the background...",
        });

        // Set up a longer timeout for the background check
        const backgroundTimeoutId = setTimeout(() => {
          toast({
            title: "Background Check Timeout",
            description:
              "The Meta Ads API is taking longer than expected. Results will update when available.",
            variant: "default",
          });
        }, 15000);

        // Start the background full check
        fetch("/api/meta-ads/check-account")
          .then((res) => res.json())
          .then((fullData) => {
            clearTimeout(backgroundTimeoutId);
            setAccountStatus(fullData);

            toast({
              title: "Account Status",
              description: fullData.message,
              variant: fullData.status === "error" ? "destructive" : "default",
            });
          })
          .catch(() => {
            clearTimeout(backgroundTimeoutId);
            toast({
              title: "Background Check Failed",
              description:
                "Could not complete the full account check. Please try again later.",
              variant: "destructive",
            });
          })
          .finally(() => {
            // We don't set isCheckingAccount to false here because we already did after the initial check
          });

        // Don't wait for background check to finish - allow user to continue
        setIsCheckingAccount(false);
        return;
      }

      // For non-pending statuses, show the standard toast
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
          {session?.facebook?.accessToken ? (
            <>
              <CardDescription>{t("instructionsDescription")}</CardDescription>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={handleDisconnectFacebook}>
                  {t("disconnectButton")}
                </Button>
              </div>
            </>
          ) : (
            <>
              <CardDescription>{t("connectDescription")}</CardDescription>
              <Button
                variant="outline"
                onClick={() =>
                  signIn("facebook", {
                    callbackUrl: `/${locale}/dashboard/meta-ads`,
                  })
                }
                className="mt-4"
              >
                {t("connectButton")}
              </Button>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {session?.facebook?.accessToken && (
            <>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() =>
                    window.open(
                      "https://www.youtube.com/watch?v=UxWZLysI4Qs",
                      "_blank",
                    )
                  }
                >
                  <PlayCircle className="h-4 w-4" /> {t("viewTutorial")}
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={checkMetaAccount}
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

                  {/* Missing Meta Ads permissions case */}
                  {accountStatus.hasRequiredScopes === false && (
                    <div className="mt-2 border-t border-yellow-200 pt-2">
                      <p className="font-semibold text-sm">
                        Missing Meta Ads Permissions
                      </p>
                      <p className="text-xs mt-1">
                        You need to grant Meta Ads access permissions to use
                        this feature:
                      </p>
                      <ol className="list-decimal list-inside text-xs mt-1">
                        <li>Click the button below to reconnect</li>
                        <li>Sign in with your Facebook/Meta account</li>
                        <li>
                          <span className="font-semibold">Important:</span> When
                          prompted, make sure to accept the permissions for Meta
                          Ads
                        </li>
                      </ol>

                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleSignInWithPermissions}
                        className="mt-2 w-full bg-blue-700 hover:bg-blue-800 text-white"
                      >
                        Reconnect with permissions
                      </Button>
                    </div>
                  )}

                  {/* No Meta Ads accounts case */}
                  {accountStatus.status === "warning" &&
                    accountStatus.hasRequiredScopes &&
                    !accountStatus.hasAdsAccounts && (
                      <div className="mt-2 text-xs">
                        <Button
                          variant="link"
                          className="h-auto p-0 text-yellow-800"
                          onClick={() =>
                            window.open(
                              "https://business.facebook.com/adsmanager/",
                              "_blank",
                            )
                          }
                        >
                          Create a Meta Ads account{" "}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    )}
                </div>
              )}

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>{t("previousQueries")}</Label>
                  <Select
                    value={selectedQuery}
                    onValueChange={handleSelectChange}
                  >
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
                  <Label htmlFor="adAccountId">{t("adAccountId")}</Label>
                  <Input
                    id="adAccountId"
                    name="adAccountId"
                    placeholder={t("adAccountIdPlaceholder")}
                    value={formData.adAccountId}
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
                    isAnalyzing ||
                    !formData.adAccountId ||
                    !startDate ||
                    !endDate
                  }
                >
                  {isAnalyzing ? t("analyzing") : t("analyze")}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t("resultsTitle")}</CardTitle>
          <CardDescription>{t("resultsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {analysisError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error analyzing Meta Ads data</AlertTitle>
              <AlertDescription>
                {analysisError}
                {analysisError.includes("Error fetching Meta Ads data") && (
                  <div className="mt-2">
                    <p className="font-semibold">What to do:</p>
                    <ul className="list-disc list-inside mt-1">
                      <li>Verify that your Ad Account ID is correct</li>
                      <li>
                        Make sure your Facebook/Meta account has access to this
                        Ad account
                      </li>
                      <li>
                        <Button
                          variant="link"
                          className="h-auto p-0"
                          onClick={() =>
                            window.open(
                              "https://business.facebook.com/adsmanager/",
                              "_blank",
                            )
                          }
                        >
                          Go to Meta Ads Manager{" "}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </li>
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {!results && !isAnalyzing && !analysisError && (
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
            <MetaAdsResultsSection
              results={results}
              userInfo={{
                name: session?.user?.name ?? "",
                email: session?.user?.email ?? "",
              }}
              queryInfo={{
                service: "Meta Ads",
                queryName: formData.queryName,
                queryData: {
                  adAccountId: formData.adAccountId,
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
