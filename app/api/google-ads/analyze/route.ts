import { NextRequest, NextResponse } from "next/server";
import { GoogleAdsApi } from "google-ads-api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { customerId, startDate, endDate } = await request.json();
    if (!customerId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "customerId, startDate, and endDate are required" },
        { status: 400 },
      );
    }

    const client = new GoogleAdsApi({
      client_id:
        process.env.GOOGLE_CLIENT_ID ||
        (() => {
          throw new Error("GOOGLE_CLIENT_ID is not defined");
        })(),
      client_secret:
        process.env.GOOGLE_CLIENT_SECRET ||
        (() => {
          throw new Error("GOOGLE_CLIENT_SECRET is not defined");
        })(),
      developer_token:
        process.env.GOOGLE_ADS_DEVELOPER_TOKEN ||
        (() => {
          throw new Error("GOOGLE_ADS_DEVELOPER_TOKEN is not defined");
        })(),
    });

    const customer = client.Customer({
      customer_id: customerId,
      refresh_token:
        session?.user.refreshToken ||
        (() => {
          throw new Error("Refresh token is not defined");
        })(),
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

    const queryResponse = await customer.query(query);

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

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error in Google Ads analyze:", error);
    return NextResponse.json(
      { error: "An error occurred while analyzing data" },
      { status: 500 },
    );
  }
}
