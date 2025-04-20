"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MicrosoftAccountStatus {
  status?: "success" | "warning" | "error" | "pending";
  message?: string;
  scope?: string;
  hasRequiredScopes?: boolean;
  hasAdsAccounts?: boolean;
  needsReconnect?: boolean;
}
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
  RefreshCcw,
  InfoIcon,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { useSearchParams } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import MicrosoftAdsResultsSection from "./MicrosoftAdsResultsSection";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";

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
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [accountStatus, setAccountStatus] = useState<any>(null);
  const [isCheckingAccount, setIsCheckingAccount] = useState(false);
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

  // Handle sign out and reconnect with permissions
  const handleSignOutAndReconnect = async () => {
    await signOut({ redirect: false });
    // Redirect to sign-in page with a parameter indicating we need Microsoft Ads permissions
    window.location.href = `/api/auth/signin?callbackUrl=${encodeURIComponent(
      window.location.href,
    )}&prompt=consent`;
  };

  // Handle token refresh - disconnect and reconnect in sequence
  const handleTokenRefresh = async () => {
    try {
      // First disconnect
      toast({
        title: "Refreshing Connection",
        description: "Disconnecting Microsoft account...",
      });

      const res = await fetch("/api/auth/disconnect/microsoft-entra-id", {
        method: "POST",
      });

      if (res.ok) {
        toast({
          title: "Reconnecting",
          description: "Please sign in with your Microsoft account",
        });

        // Then redirect to sign-in page
        setTimeout(() => {
          signIn("microsoft-entra-id", {
            callbackUrl: `/${locale}/dashboard/microsoft-ads`,
            prompt: "consent",
          });
        }, 1000);
      } else {
        toast({
          title: t("disconnectErrorTitle") || "Error",
          description:
            t("disconnectErrorDescription") || "Could not disconnect account",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: t("errorTitle") || "Error",
        description: t("operationFailed") || "Operation failed",
        variant: "destructive",
      });
    }
  };

  // Check Microsoft Account
  const checkMicrosoftAccount = async () => {
    setIsCheckingAccount(true);
    setAnalysisError(null);

    // First, do a fast check that skips the slow API call
    try {
      const res = await fetch(
        "/api/microsoft-ads/check-account?skipSlowCheck=true",
      );
      const data = await res.json();
      setAccountStatus(data);

      if (data.status === "pending") {
        // We got back the basic permission check, now start a background check for full access
        toast({
          title: "Initial Check Complete",
          description: "Checking Microsoft Ads API access in the background...",
        });

        // Set up a longer timeout for the background check
        const backgroundTimeoutId = setTimeout(() => {
          toast({
            title: "Background Check Timeout",
            description:
              "The Microsoft Ads API is taking longer than expected. Results will update when available.",
            variant: "default",
          });
        }, 15000);

        // Start the background full check
        fetch("/api/microsoft-ads/check-account")
          .then((res) => res.json())
          .then((fullData) => {
            clearTimeout(backgroundTimeoutId);
            setAccountStatus(fullData);

            if (fullData.status === "error") {
              toast({
                title: "Account Status",
                description: fullData.message,
                variant: "destructive",
              });
            } else if (
              fullData.status === "warning" &&
              fullData.needsReconnect
            ) {
              toast({
                title: "Token Refresh Required",
                description:
                  "Your Microsoft Ads token has expired. Please refresh your connection.",
                variant: "destructive",
              });
            } else if (fullData.status === "warning") {
              toast({
                title: "Account Status",
                description: fullData.message,
                variant: "default",
              });
            } else if (fullData.status === "success") {
              toast({
                title: "Account Status",
                description: fullData.message,
              });
            }
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
      if (data.status === "error") {
        toast({
          title: "Account Status",
          description: data.message,
          variant: "destructive",
        });
      } else if (data.status === "warning" && data.needsReconnect) {
        toast({
          title: "Token Refresh Required",
          description:
            "Your Microsoft Ads token has expired. Please refresh your connection.",
          variant: "destructive",
        });
      } else if (data.status === "warning") {
        toast({
          title: "Account Status",
          description: data.message,
          variant: "default",
        });
      } else if (data.status === "success") {
        toast({
          title: "Account Status",
          description: data.message,
        });
      }
    } catch (err) {
      toast({
        title: t("errorTitle") || "Error",
        description: t("operationFailed") || "Operation failed",
        variant: "destructive",
      });
    } finally {
      setIsCheckingAccount(false);
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
    setAnalysisError(null);
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

      const data = await res.json();

      if (!res.ok) {
        let errorMessage = data.error || t("analyzeErrorDescription");
        let needsTokenRefresh = false;

        // Check if it's a token expiration issue
        if (
          typeof data.error === "string" &&
          data.error.includes("AuthenticationTokenExpired")
        ) {
          errorMessage =
            "Your Microsoft Ads authentication token has expired. Please refresh your connection.";
          needsTokenRefresh = true;
        } else if (typeof data === "object" && data.Errors) {
          // Direct response from Microsoft API
          const tokenError = data.Errors.find(
            (e: any) =>
              e.Message?.includes("Authentication token expired") ||
              e.ErrorCode === "AuthenticationTokenExpired",
          );

          if (tokenError) {
            errorMessage =
              "Your Microsoft Ads authentication token has expired. Please refresh your connection.";
            needsTokenRefresh = true;
          }
        }
        if (needsTokenRefresh) {
          // Store in state that we need a token refresh
        }
      } else {
        setResults(data);
        toast({
          title: t("analyzeSuccessTitle"),
          description: t("analyzeSuccessDescription"),
        });

        // If we had a successful analysis, update the account status to reflect this
        setAccountStatus((prev: MicrosoftAccountStatus | null) =>
          prev
            ? {
                ...prev,
                status: "success" as const,
                hasAdsAccounts: true,
                message:
                  "Microsoft account properly connected with access to Microsoft Ads.",
              }
            : null,
        );
      }
    } catch (err) {
      setAnalysisError(t("analyzeErrorDescription"));
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
              <CardDescription>{t("briefInstructions")}</CardDescription>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={handleDisconnectMicrosoft}>
                  {t("disconnectButton")}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleTokenRefresh}
                  className="gap-1"
                >
                  <RefreshCcw className="h-4 w-4" /> {t("refreshConnection")}
                </Button>
              </div>
            </>
          )}
        </CardHeader>
        {session?.microsoft?.accessToken && (
          <CardContent className="space-y-4">
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <InfoIcon className="h-5 w-5 text-blue-600" />
              <AlertTitle className="text-blue-800 font-medium">
                {t("msAdsRequirement")}
              </AlertTitle>
              <AlertDescription className="text-blue-700">
                <p>{t("queryDescription")}</p>
                <div className="mt-2">
                  <p className="font-medium">{t("findIDs")}</p>
                  <Button
                    variant="link"
                    className="p-0 h-auto mt-1 text-blue-700"
                    onClick={() =>
                      window.open("https://ads.microsoft.com/", "_blank")
                    }
                  >
                    {t("openMicrosoftAds")}{" "}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex flex-wrap gap-2">
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
              <Button
                variant="outline"
                className="gap-2"
                onClick={checkMicrosoftAccount}
                disabled={isCheckingAccount}
              >
                <Eye className="h-4 w-4" />{" "}
                {isCheckingAccount ? t("checking") : t("checkAccountStatus")}
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

                {/* Missing Microsoft Ads permissions case */}
                {accountStatus.hasRequiredScopes === false && (
                  <div className="mt-2 border-t border-yellow-200 pt-2">
                    <p className="font-semibold text-sm">
                      Missing Microsoft Ads Permissions
                    </p>
                    <p className="text-xs mt-1">
                      You need to grant Microsoft Ads access permissions to use
                      this feature:
                    </p>
                    <ol className="list-decimal list-inside text-xs mt-1">
                      <li>Click the button below to sign out</li>
                      <li>Sign in again with your Microsoft account</li>
                      <li>
                        <span className="font-semibold">Important:</span> When
                        prompted, make sure to accept all permissions for
                        Microsoft Advertising
                      </li>
                    </ol>

                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSignOutAndReconnect}
                      className="mt-2 w-full bg-blue-700 hover:bg-blue-800 text-white"
                    >
                      Sign out and reconnect with permissions
                    </Button>
                  </div>
                )}

                {/* Token expired or needs refresh */}
                {accountStatus.needsReconnect && (
                  <div className="mt-2 border-t border-yellow-200 pt-2">
                    <p className="font-semibold text-sm">
                      Authentication Token Expired
                    </p>
                    <p className="text-xs mt-1">
                      Your Microsoft Ads authentication token has expired. This
                      happens periodically and requires refreshing your
                      connection:
                    </p>

                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleTokenRefresh}
                      className="mt-2 w-full bg-blue-700 hover:bg-blue-800 text-white flex items-center gap-1"
                    >
                      <RefreshCcw className="h-4 w-4" /> Refresh Microsoft
                      Connection
                    </Button>
                  </div>
                )}

                {/* No Microsoft Ads accounts case */}
                {accountStatus.status === "warning" &&
                  accountStatus.hasRequiredScopes &&
                  !accountStatus.hasAdsAccounts &&
                  !accountStatus.needsReconnect && (
                    <div className="mt-2 text-xs">
                      <Button
                        variant="link"
                        className="h-auto p-0 text-yellow-800"
                        onClick={() =>
                          window.open("https://ads.microsoft.com/", "_blank")
                        }
                      >
                        Create a Microsoft Ads account{" "}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  )}
              </div>
            )}

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
          {analysisError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error analyzing Microsoft Ads data</AlertTitle>
              <AlertDescription>
                {analysisError}
                {analysisError.includes("Authentication token expired") && (
                  <div className="mt-2">
                    <p className="font-semibold">
                      Your authentication token has expired
                    </p>
                    <p className="mt-1 text-sm">
                      Microsoft Ads access tokens expire periodically. You need
                      to refresh your connection:
                    </p>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleTokenRefresh}
                      className="mt-2 w-full bg-blue-700 hover:bg-blue-800 text-white flex items-center justify-center gap-1"
                    >
                      <RefreshCcw className="h-4 w-4" /> Refresh Microsoft
                      Connection
                    </Button>
                  </div>
                )}
                {!analysisError.includes("Authentication token expired") && (
                  <div className="mt-2">
                    <p className="font-semibold">What to do:</p>
                    <ul className="list-disc list-inside mt-1">
                      <li>
                        Verify that your Account ID and Customer ID are correct
                      </li>
                      <li>
                        Make sure your Microsoft account has access to this
                        Microsoft Ads account
                      </li>
                      <li>
                        <Button
                          variant="link"
                          className="h-auto p-0"
                          onClick={() =>
                            window.open("https://ads.microsoft.com/", "_blank")
                          }
                        >
                          Go to Microsoft Advertising{" "}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </li>
                      <li>
                        If you continue to see errors, try refreshing your
                        connection:
                        <Button
                          variant="link"
                          className="h-auto p-0 ml-1"
                          onClick={handleTokenRefresh}
                        >
                          Refresh Microsoft Connection
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
