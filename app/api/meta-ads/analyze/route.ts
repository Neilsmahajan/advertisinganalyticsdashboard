import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    console.log("MetaAds analyze session:", session);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { adAccountId, accessToken, startDate, endDate } =
      await request.json();
    console.log("MetaAds analyze payload:", {
      adAccountId,
      accessToken,
      startDate,
      endDate,
    });
    if (!adAccountId || !accessToken || !startDate || !endDate) {
      return NextResponse.json(
        {
          error:
            "adAccountId, accessToken, startDate, and endDate are required",
        },
        { status: 400 },
      );
    }

    // Use the provided accessToken (from request body) instead of session.facebook
    const apiUrl = `https://graph.facebook.com/v21.0/act_${adAccountId}/insights?access_token=${accessToken}&fields=campaign_id,campaign_name,impressions,clicks,spend,reach&level=campaign&time_range={"since":"${startDate}","until":"${endDate}"}`;
    console.log("MetaAds analyze API URL:", apiUrl);
    const metaResponse = await fetch(apiUrl);
    if (!metaResponse.ok) {
      const errorData = await metaResponse.json();
      console.error("MetaAds analyze fetch error:", errorData);
      return NextResponse.json(
        { error: errorData.error || "Error fetching Meta Ads data" },
        { status: metaResponse.status },
      );
    }
    const data = await metaResponse.json();
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalSpend = 0;
    let totalReach = 0;
    const campaigns = [];

    for (const row of data.data || []) {
      const impressions = Number(row.impressions ?? 0);
      const clicks = Number(row.clicks ?? 0);
      const spend = Number(row.spend ?? 0);
      const reach = Number(row.reach ?? 0);

      totalImpressions += impressions;
      totalClicks += clicks;
      totalSpend += spend;
      totalReach += reach;

      campaigns.push({
        name: row.campaign_name,
        impressions,
        clicks,
        cost: `$${spend.toFixed(2)}`,
        reach,
      });
    }

    const result = {
      impressions: totalImpressions,
      clicks: totalClicks,
      cost: `$${totalSpend.toFixed(2)}`,
      reach: totalReach,
      campaigns,
    };

    console.log("MetaAds analyze result:", result);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error in Meta Ads analyze:", error);
    return NextResponse.json(
      { error: "An error occurred while analyzing Meta Ads data" },
      { status: 500 },
    );
  }
}
