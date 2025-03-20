"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, PlayCircle, Save, Eye } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

export default function MicrosoftAdsPage() {
  const [formData, setFormData] = useState({
    queryName: "",
    accountId: "",
    customerId: "",
  })
  const [selectedQuery, setSelectedQuery] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<null | any>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setSelectedQuery(value)
    // In a real app, you would load the saved query data here
    if (value === "previous-query-1") {
      setFormData({
        queryName: "Main Microsoft Ads Campaign",
        accountId: "138753866",
        customerId: "253842102",
      })
      setStartDate(new Date(2023, 0, 1))
      setEndDate(new Date(2023, 0, 31))
    }
  }

  const handleSaveQuery = () => {
    if (!formData.queryName) {
      toast({
        title: "Error",
        description: "Please enter a query name",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Query Saved",
      description: `Query "${formData.queryName}" has been saved.`,
    })
  }

  const handleAnalyze = () => {
    if (!formData.accountId || !formData.customerId || !startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)

    // Simulate API call
    setTimeout(() => {
      setIsAnalyzing(false)
      setResults({
        impressions: 345678,
        clicks: 8765,
        ctr: "2.53%",
        spend: "$2,345.67",
        conversions: 321,
        costPerConversion: "$7.31",
        campaigns: [
          { name: "Search Campaign", impressions: 123456, clicks: 3456, spend: "$1,234.56" },
          { name: "Display Campaign", impressions: 87654, clicks: 2345, spend: "$876.54" },
          { name: "Shopping Campaign", impressions: 65432, clicks: 1234, spend: "$654.32" },
          { name: "Audience Campaign", impressions: 43210, clicks: 987, spend: "$432.10" },
          { name: "Dynamic Search Ads", impressions: 21098, clicks: 765, spend: "$210.98" },
        ],
      })

      toast({
        title: "Analysis Complete",
        description: "Microsoft Ads data has been retrieved.",
      })
    }, 2000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Microsoft Ads</h1>
        <p className="text-muted-foreground">
          Connect to your Microsoft Ads account to view your campaign performance.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
            <CardDescription>Follow these steps to use this application with your Microsoft Ads data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>
                Click Connect with Microsoft Ads and select your Microsoft account associated with your Microsoft Ads
                account. If the pop-up is blocked, click the pop-up icon on the next to the address bar.
              </li>
              <li>Log in to Microsoft Ads Dashboard and select your Microsoft Ads Account.</li>
              <li>
                Click the Campaigns tab on the left and get your Account ID (e.g., 138753866) and your Customer ID
                (e.g., 253842102) listed in the URL after 'aid=' and 'cid=' respectively along with the desired date
                range, and click Analyze.
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
                    <SelectItem value="previous-query-1">Main Microsoft Ads Campaign</SelectItem>
                    <SelectItem value="previous-query-2">Search Campaign</SelectItem>
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
                <Label htmlFor="accountId">Account ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="accountId"
                    name="accountId"
                    placeholder="Enter Account ID"
                    value={formData.accountId}
                    onChange={handleChange}
                  />
                  <Button variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerId">Customer ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="customerId"
                    name="customerId"
                    placeholder="Enter Customer ID"
                    value={formData.customerId}
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
                      <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
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
                      <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Button className="w-full" onClick={handleAnalyze} disabled={isAnalyzing}>
                {isAnalyzing ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Microsoft Ads data for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {!results && !isAnalyzing && (
              <div className="flex items-center justify-center h-[400px] bg-muted/20 rounded-md">
                <p className="text-muted-foreground">
                  Enter your Account ID, Customer ID and date range, then click Analyze to see results
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center h-[400px] bg-muted/20 rounded-md">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-muted-foreground">Fetching Microsoft Ads data...</p>
              </div>
            )}

            {results && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted/20 p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">Impressions</p>
                    <p className="text-2xl font-bold">{results.impressions.toLocaleString()}</p>
                  </div>
                  <div className="bg-muted/20 p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">Clicks</p>
                    <p className="text-2xl font-bold">{results.clicks.toLocaleString()}</p>
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
                    <p className="text-sm text-muted-foreground">Conversions</p>
                    <p className="text-2xl font-bold">{results.conversions}</p>
                  </div>
                  <div className="bg-muted/20 p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">Cost/Conv</p>
                    <p className="text-2xl font-bold">{results.costPerConversion}</p>
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
                          <span>{campaign.impressions.toLocaleString()} impressions</span>
                          <span>{campaign.clicks.toLocaleString()} clicks</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-[150px] bg-muted/20 rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">Campaign performance chart will appear here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

