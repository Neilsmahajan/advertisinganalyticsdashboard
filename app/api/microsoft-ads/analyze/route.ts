import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.microsoft?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { accountId, customerId, startDate, endDate } = await request.json();
    if (!accountId || !customerId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "accountId, customerId, startDate and endDate are required" },
        { status: 400 },
      );
    }

    // Simulate MS Ads analysis (dummy data)
    const result = {
      impressions: 123456,
      clicks: 7890,
      ctr: "6.41%",
      spend: "$1,234.56",
      conversions: 123,
      costPerConversion: "$10.03",
      campaigns: [
        {
          name: "Bing Campaign 1",
          impressions: 40000,
          clicks: 2500,
          spend: "$400.00",
        },
        {
          name: "Bing Campaign 2",
          impressions: 83456,
          clicks: 5390,
          spend: "$834.56",
        },
      ],
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error in Microsoft Ads analyze:", error);
    return NextResponse.json(
      { error: "An error occurred while analyzing data" },
      { status: 500 },
    );
  }
}
