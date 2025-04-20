import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import JSZip from "jszip"; // <-- added import for extracting the zip

const SUBMIT_URL =
  "https://reporting.api.bingads.microsoft.com/Reporting/v13/GenerateReport/Submit";
const POLL_URL =
  "https://reporting.api.bingads.microsoft.com/Reporting/v13/GenerateReport/Poll";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Updated parseCSV: This function skips metadata before the header.
function parseCSV(csvText: string) {
  const lines = csvText.trim().split("\n");
  // find the header line (must contain CampaignName)
  const start = lines.findIndex((line) => line.includes("CampaignName"));
  if (start === -1) return [];
  const headerLine = lines[start];
  const headers = headerLine.split(",").map((h) => h.replace(/"/g, "").trim());
  const dataLines = [];
  for (let j = start + 1; j < lines.length; j++) {
    const line = lines[j].trim();
    // stop if the line is empty or if it starts with a copyright marker
    if (!line || line.startsWith('"©')) break;
    dataLines.push(line);
  }
  const rows = dataLines.map((line) => {
    const values = line.split(",").map((v) => v.replace(/"/g, "").trim());
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
      FormatVersion: "2.0", // <-- added to match manual workflow
      ReportName: "Campaign Performance Report",
      ReturnOnlyCompleteData: false,
      Type: "CampaignPerformanceReportRequest",
      Aggregation: "Summary", // <-- changed from "Daily" to "Summary"
      Columns: [
        // Removed "TimePeriod",
        "CampaignId",
        "CampaignName",
        "Impressions",
        "Clicks",
        "Spend",
        "Ctr",
      ],
      Scope: {
        AccountIds: [accountId],
        // Campaigns not required if not filtering by campaigns.
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

    // Set required headers for submit and poll; note: for GET, remove Content-Type and add Accept.
    const commonHeaders = {
      Authorization: `Bearer ${session.microsoft.accessToken}`,
      DeveloperToken: process.env.MICROSOFT_ADS_DEVELOPER_TOKEN || "",
      CustomerAccountId: accountId.toString(),
      CustomerId: customerId.toString(),
    };
    // Submit request uses full headers including Content-Type.
    const submitHeaders = {
      ...commonHeaders,
      "Content-Type": "application/json",
    };

    // Submit report request
    const submitResp = await fetch(SUBMIT_URL, {
      method: "POST",
      headers: submitHeaders,
      body: JSON.stringify({ ReportRequest: reportRequest }),
    });
    if (!submitResp.ok) {
      const errText = await submitResp.text();
      console.error("[analyze] Submit response error:", errText);

      // Check specifically for token expiration errors
      if (
        errText.includes("AuthenticationTokenExpired") ||
        errText.includes("Authentication token expired")
      ) {
        return NextResponse.json(
          {
            error:
              "Authentication token expired. Please refresh your Microsoft connection.",
          },
          { status: 401 },
        );
      }

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

    // Poll for report completion using POST with JSON body (not GET with query params)
    let downloadUrl = "";
    const maxAttempts = 12;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await delay(5000);
      const pollResp = await fetch(POLL_URL, {
        method: "POST",
        headers: { ...commonHeaders, "Content-Type": "application/json" }, // headers matching cURL command
        body: JSON.stringify({ ReportRequestId: reportRequestId }),
      });
      if (!pollResp.ok) {
        const pollStatus = pollResp.status;
        const pollBody = await pollResp.text();
        console.warn(
          `[analyze] Poll attempt ${
            attempt + 1
          } non-ok response. Status: ${pollStatus}; Body: ${pollBody}`,
        );
        continue;
      }
      const pollJson = await pollResp.json();
      console.log(`[analyze] Poll attempt ${attempt + 1}:`, pollJson);
      if (
        pollJson.ReportRequestStatus &&
        pollJson.ReportRequestStatus.Status === "Success" &&
        pollJson.ReportRequestStatus.ReportDownloadUrl
      ) {
        downloadUrl = pollJson.ReportRequestStatus.ReportDownloadUrl;
        break;
      }
    }
    if (!downloadUrl) {
      console.error("[analyze] Report not ready after polling");
      return NextResponse.json({ error: "Report not ready" }, { status: 500 });
    }

    // Fetch the zip file containing the CSV report
    const downloadResp = await fetch(downloadUrl);
    if (!downloadResp.ok) {
      const downloadErr = await downloadResp.text();
      console.error("[analyze] Download report error:", downloadErr);
      return NextResponse.json(
        { error: "Failed to download report" },
        { status: 500 },
      );
    }
    const downloadBuffer = await downloadResp.arrayBuffer();
    const zip = await JSZip.loadAsync(downloadBuffer);
    // Assume the zip contains one CSV file – find it by file name ending with .csv
    const csvFileName = Object.keys(zip.files).find((name) =>
      name.endsWith(".csv"),
    );
    if (!csvFileName) {
      console.error("[analyze] CSV file not found in zip");
      return NextResponse.json({ error: "CSV file missing" }, { status: 500 });
    }
    const csvFile = zip.files[csvFileName];
    const csvText = await csvFile.async("string");
    console.log("[analyze] CSV extracted, length:", csvText.length);
    const rows = parseCSV(csvText);

    // Aggregate overall totals while mapping per-campaign data
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalSpend = 0;
    const campaigns = rows.map((row) => {
      const impressions = parseInt(row["Impressions"]) || 0;
      const clicks = parseInt(row["Clicks"]) || 0;
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
    // Compute overall CTR from totals.
    const overallCtr =
      totalImpressions > 0
        ? ((totalClicks / totalImpressions) * 100).toFixed(2) + "%"
        : "0%";

    console.log("[analyze] Aggregated results:", {
      totalImpressions,
      totalClicks,
      totalSpend,
      campaignCount: campaigns.length,
    });

    // Return results with overall totals renamed to match front-end expectation.
    return NextResponse.json(
      {
        impressions: totalImpressions,
        clicks: totalClicks,
        spend: "$" + totalSpend.toFixed(2),
        ctr: overallCtr,
        campaigns,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[analyze] Error in Microsoft Ads analyze:", error);

    // Check if the error message might indicate token expiration
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (
      errorMessage.includes("AuthenticationTokenExpired") ||
      errorMessage.includes("Authentication token expired") ||
      (errorMessage.includes("token") && errorMessage.includes("expire"))
    ) {
      return NextResponse.json(
        {
          error:
            "Authentication token expired. Please refresh your Microsoft connection.",
        },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: "An error occurred while analyzing data" },
      { status: 500 },
    );
  }
}
