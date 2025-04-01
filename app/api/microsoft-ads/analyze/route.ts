import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const SUBMIT_URL =
  "https://reporting.api.bingads.microsoft.com/Reporting/v13/GenerateReport/Submit";
const POLL_URL =
  "https://reporting.api.bingads.microsoft.com/Reporting/v13/GenerateReport/Poll";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseCSV(csvText: string) {
  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx];
    });
    return obj;
  });
  return rows;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    console.log("[analyze] Session:", session);
    if (!session || !session.microsoft?.accessToken) {
      console.error("[analyze] Unauthorized access");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { accountId, customerId, startDate, endDate } = await request.json();
    console.log("[analyze] Received payload:", {
      accountId,
      customerId,
      startDate,
      endDate,
    });
    if (!accountId || !customerId || !startDate || !endDate) {
      console.error("[analyze] Missing required fields");
      return NextResponse.json(
        { error: "accountId, customerId, startDate and endDate are required" },
        { status: 400 },
      );
    }

    // Build CampaignPerformanceReportRequest payload
    const reportRequest = {
      ExcludeColumnHeaders: false,
      ExcludeReportFooter: false,
      ExcludeReportHeader: false,
      Format: "Csv",
      ReportName: "Campaign Performance Report",
      ReturnOnlyCompleteData: false,
      Type: "CampaignPerformanceReportRequest",
      Aggregation: "Daily",
      Columns: [
        "TimePeriod",
        "CampaignId",
        "CampaignName",
        "Impressions",
        "Clicks",
        "Spend",
        "Ctr",
      ],
      Scope: {
        AccountIds: [accountId],
        Campaigns: null,
      },
      Time: {
        CustomDateRangeStart: {
          Year: parseInt(startDate.split("-")[0]),
          Month: parseInt(startDate.split("-")[1]),
          Day: parseInt(startDate.split("-")[2]),
        },
        CustomDateRangeEnd: {
          Year: parseInt(endDate.split("-")[0]),
          Month: parseInt(endDate.split("-")[1]),
          Day: parseInt(endDate.split("-")[2]),
        },
        PredefinedTime: null,
        ReportTimeZone: "PacificTimeUSCanadaTijuana",
      },
    };

    // Set required headers
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.microsoft.accessToken}`,
      DeveloperToken: process.env.MICROSOFT_ADS_DEVELOPER_TOKEN || "",
      CustomerAccountId: accountId.toString(),
      CustomerId: customerId.toString(),
    };

    // Submit report request
    const submitResp = await fetch(SUBMIT_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ ReportRequest: reportRequest }),
    });
    if (!submitResp.ok) {
      const errText = await submitResp.text();
      console.error("[analyze] Submit response error:", errText);
      return NextResponse.json({ error: errText }, { status: 500 });
    }
    const submitJson = await submitResp.json();
    console.log("[analyze] Submit response:", submitJson);
    const reportRequestId = submitJson.ReportRequestId;
    if (!reportRequestId) {
      console.error("[analyze] Missing ReportRequestId");
      return NextResponse.json(
        { error: "No ReportRequestId returned" },
        { status: 500 },
      );
    }

    // Poll for report completion
    let reportStatus = "";
    let downloadUrl = "";
    const maxAttempts = 12;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await delay(5000);
      const pollResp = await fetch(
        `${POLL_URL}?ReportRequestId=${reportRequestId}`,
        {
          method: "GET",
          headers,
        },
      );
      if (!pollResp.ok) {
        console.warn(`[analyze] Poll attempt ${attempt + 1} non-ok response`);
        continue;
      }
      const pollJson = await pollResp.json();
      console.log(`[analyze] Poll attempt ${attempt + 1}:`, pollJson);
      reportStatus = pollJson.ReportStatus;
      if (reportStatus === "Success" && pollJson.ReportDownloadUrl) {
        downloadUrl = pollJson.ReportDownloadUrl;
        break;
      }
    }
    if (reportStatus !== "Success" || !downloadUrl) {
      console.error("[analyze] Report not ready after polling");
      return NextResponse.json({ error: "Report not ready" }, { status: 500 });
    }

    // Fetch the CSV report
    const downloadResp = await fetch(downloadUrl);
    if (!downloadResp.ok) {
      const downloadErr = await downloadResp.text();
      console.error("[analyze] Download report error:", downloadErr);
      return NextResponse.json(
        { error: "Failed to download report" },
        { status: 500 },
      );
    }
    const csvText = await downloadResp.text();
    console.log("[analyze] CSV downloaded, length:", csvText.length);
    const rows = parseCSV(csvText);

    // Aggregate overall totals and compute CTR per campaign
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalSpend = 0;
    const campaigns = rows.map((row) => {
      const impressions = parseInt(row["Impressions"]) || 0;
      const clicks = parseInt(row["Clicks"]) || 0;
      // Remove any non-numeric characters from Spend (e.g. $ and commas)
      const spend = parseFloat(row["Spend"].replace(/[^0-9.]/g, "")) || 0;
      totalImpressions += impressions;
      totalClicks += clicks;
      totalSpend += spend;
      const ctr =
        impressions > 0
          ? ((clicks / impressions) * 100).toFixed(2) + "%"
          : "0%";
      return {
        CampaignId: row["CampaignId"],
        CampaignName: row["CampaignName"],
        Impressions: impressions,
        Clicks: clicks,
        Spend: "$" + spend.toFixed(2),
        Ctr: ctr,
      };
    });

    console.log("[analyze] Aggregated results:", {
      totalImpressions,
      totalClicks,
      totalSpend,
      campaignCount: campaigns.length,
    });

    return NextResponse.json(
      {
        total_impressions: totalImpressions,
        total_clicks: totalClicks,
        total_spend: "$" + totalSpend.toFixed(2),
        campaigns,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[analyze] Error in Microsoft Ads analyze:", error);
    return NextResponse.json(
      { error: "An error occurred while analyzing data" },
      { status: 500 },
    );
  }
}
