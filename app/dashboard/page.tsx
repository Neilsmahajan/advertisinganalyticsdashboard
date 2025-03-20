import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Users, BarChart3, LineChart, TrendingUp, Clock } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your analytics dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Clock className="mr-2 h-4 w-4" />
            Last 7 days
          </Button>
          <Button size="sm">
            <TrendingUp className="mr-2 h-4 w-4" />
            View Reports
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4M</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48.2K</div>
            <p className="text-xs text-muted-foreground">+12.3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CTR</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.1%</div>
            <p className="text-xs text-muted-foreground">+1.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,203</div>
            <p className="text-xs text-muted-foreground">+4.5% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full bg-muted/20 rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Performance chart will appear here</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Campaigns</CardTitle>
            <CardDescription>Your best performing campaigns this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-full">
                  <p className="text-sm font-medium">Summer Sale</p>
                  <div className="h-2 w-full bg-muted mt-1 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: "75%" }}></div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-medium">75%</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-full">
                  <p className="text-sm font-medium">New Product Launch</p>
                  <div className="h-2 w-full bg-muted mt-1 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: "63%" }}></div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-medium">63%</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-full">
                  <p className="text-sm font-medium">Holiday Special</p>
                  <div className="h-2 w-full bg-muted mt-1 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: "52%" }}></div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-medium">52%</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-full">
                  <p className="text-sm font-medium">Retargeting</p>
                  <div className="h-2 w-full bg-muted mt-1 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: "48%" }}></div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-medium">48%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

