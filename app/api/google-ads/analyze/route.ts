import { NextRequest, NextResponse } from "next/server";
import { GoogleAdsApi } from "google-ads-api";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma"; // added import

export async function POST(request: NextRequest) {
  console.log("[google-ads/analyze] Starting analysis request");
  try {
    const session = await auth();
    if (!session) {
      console.error("[google-ads/analyze] Unauthorized - No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log(`[google-ads/analyze] Authenticated user: ${session.user.id}`);

    const { customerId, startDate, endDate } = await request.json();
    console.log(
      `[google-ads/analyze] Request parameters: customerId=${customerId}, startDate=${startDate}, endDate=${endDate}`,
    );

    if (!customerId || !startDate || !endDate) {
      console.error("[google-ads/analyze] Missing required parameters");
      return NextResponse.json(
        { error: "customerId, startDate, and endDate are required" },
        { status: 400 },
      );
    }

    // Validate customerId format (should be exactly 10 digits)
    if (!/^\d{10}$/.test(customerId.toString())) {
      console.error(
        `[google-ads/analyze] Invalid customerId format: ${customerId}`,
      );
      return NextResponse.json(
        { error: "customerId must be exactly 10 digits" },
        { status: 400 },
      );
    }

    // Ensure refresh token is available
    let refreshToken = session?.user.refreshToken;
    console.log(
      `[google-ads/analyze] Session refresh token available: ${Boolean(
        refreshToken,
      )}`,
    );

    if (!refreshToken) {
      console.log(
        "[google-ads/analyze] No refresh token in session, attempting to fetch from database",
      );
      const account = await prisma.account.findFirst({
        where: { userId: session.user.id, provider: "google" },
      });

      if (!account) {
        console.error("[google-ads/analyze] No Google account found for user");
        return NextResponse.json(
          { error: "No Google account linked to this user" },
          { status: 400 },
        );
      }

      if (!account.refresh_token) {
        console.error("[google-ads/analyze] No refresh token found in account");
        return NextResponse.json(
          {
            error:
              "Missing refresh token. Please reconnect your Google account",
          },
          { status: 400 },
        );
      }

      refreshToken = account.refresh_token;
      console.log("[google-ads/analyze] Retrieved refresh token from database");
    }

    // Check for required environment variables
    const requiredEnvVars = {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      GOOGLE_ADS_DEVELOPER_TOKEN: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    };

    for (const [key, value] of Object.entries(requiredEnvVars)) {
      if (!value) {
        console.error(
          `[google-ads/analyze] Missing environment variable: ${key}`,
        );
        return NextResponse.json(
          { error: `Server configuration error: Missing ${key}` },
          { status: 500 },
        );
      }
    }

    console.log("[google-ads/analyze] Creating Google Ads API client");
    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
    });

    console.log(
      `[google-ads/analyze] Setting up customer with ID: ${customerId}`,
    );
    const customer = client.Customer({
      customer_id: customerId,
      refresh_token: refreshToken,
    });

    // Build the query using the provided dates
    const query = `
      SELECT
        campaign.id,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions
      FROM campaign
      WHERE segments.date >= '${startDate}'
        AND segments.date <= '${endDate}'
      ORDER BY campaign.id
    `;
    console.log(`[google-ads/analyze] Executing query: ${query}`);

    try {
      const queryResponse = await customer.query(query);
      console.log(
        `[google-ads/analyze] Query successful, received ${queryResponse.length} campaigns`,
      );

      // Aggregate overall metrics and build campaigns array
      let totalImpressions = 0;
      let totalClicks = 0;
      let totalCostMicros = 0;
      let totalConversions = 0;
      const campaigns = [];

      for (const row of queryResponse) {
        const impressions = Number(row.metrics?.impressions ?? 0);
        const clicks = Number(row.metrics?.clicks ?? 0);
        const costMicros = Number(row.metrics?.cost_micros ?? 0);
        const conversions = Number(row.metrics?.conversions || 0);

        totalImpressions += impressions;
        totalClicks += clicks;
        totalCostMicros += costMicros;
        totalConversions += conversions;

        campaigns.push({
          name: row.campaign?.name,
          impressions,
          clicks,
          cost: `$${(costMicros / 1e6).toFixed(2)}`,
        });
      }

      const totalCost = totalCostMicros / 1e6;
      const ctr =
        totalImpressions > 0
          ? ((totalClicks / totalImpressions) * 100).toFixed(2) + "%"
          : "0%";
      const costPerConversion =
        totalConversions > 0
          ? `$${(totalCost / totalConversions).toFixed(2)}`
          : "$0.00";

      const result = {
        impressions: totalImpressions,
        clicks: totalClicks,
        ctr,
        cost: `$${totalCost.toFixed(2)}`,
        conversions: totalConversions,
        costPerConversion,
        campaigns,
      };

      console.log(
        `[google-ads/analyze] Analysis complete: ${totalImpressions} impressions, ${totalClicks} clicks, ${campaigns.length} campaigns`,
      );
      return NextResponse.json(result, { status: 200 });
    } catch (apiError: any) {
      // Handle specific Google Ads API errors
      console.error("[google-ads/analyze] Google Ads API error:", apiError);

      // Check for common error types
      const errorDetails = apiError.response?.errors || [];
      const errorMessages = errorDetails
        .map((e: any) => e.message || e.errorString || "Unknown error")
        .join("; ");

      let statusCode = 500;
      let errorMessage = "An error occurred while analyzing data";

      if (apiError.message?.includes("authentication")) {
        statusCode = 401;
        errorMessage =
          "Authentication failed. Please reconnect your Google account.";
      } else if (
        apiError.message?.includes("permission") ||
        apiError.message?.includes("access")
      ) {
        statusCode = 403;
        errorMessage =
          "Permission denied. Your account may not have access to this customer ID.";
      } else if (
        apiError.message?.includes("not found") ||
        apiError.message?.includes("invalid customer")
      ) {
        statusCode = 404;
        errorMessage =
          "Customer ID not found or invalid. Please verify the customer ID.";
      } else if (
        errorMessages.includes("not associated with any Ads accounts")
      ) {
        // Specific message for accounts without Ads access
        statusCode = 403;
        errorMessage =
          "The Google account that generated the OAuth access tokens is not associated with any Ads accounts. Create a new Ads account, or add your Google account to an existing Ads account.";
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: errorMessages || apiError.message,
          code: apiError.code || "UNKNOWN_ERROR",
        },
        { status: statusCode },
      );
    }
  } catch (error: any) {
    console.error("[google-ads/analyze] Unhandled error:", error);
    return NextResponse.json(
      {
        error: "An error occurred while analyzing data",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
