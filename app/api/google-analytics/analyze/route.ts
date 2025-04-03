import { NextRequest, NextResponse } from "next/server";
import { format, parse } from "date-fns";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

export async function POST(request: NextRequest) {
  try {
    const { propertyId, startDate, endDate } = await request.json();
    if (!propertyId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "propertyId, startDate, and endDate are required" },
        { status: 400 },
      );
    }

    if (
      !process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_PRIVATE_KEY_ID ||
      !process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_PRIVATE_KEY ||
      !process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_CLIENT_ID
    ) {
      console.error("One or more GA env variables are missing");
      return NextResponse.json(
        { error: "Server configuration error: Missing GA credentials" },
        { status: 500 },
      );
    }

    const credentials = {
      type: "service_account",
      project_id: "advertisinganalytics-dashboard",
      private_key_id:
        process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_PRIVATE_KEY_ID,
      // Replace escaped newlines with actual newline characters
      private_key:
        process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_PRIVATE_KEY.replace(
          /\\n/g,
          "\n",
        ),
      client_email:
        "google-analytics@advertisinganalytics-dashboard.iam.gserviceaccount.com",
      client_id: process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url:
        "https://www.googleapis.com/robot/v1/metadata/x509/google-analytics%40advertisinganalytics-dashboard.iam.gserviceaccount.com",
      universe_domain: "googleapis.com",
    };

    // Create the GA Data API client with credentials
    const client = new BetaAnalyticsDataClient({ credentials });

    // Build the report request.
    const requestBody = {
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate,
          endDate,
        },
      ],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "sessions" },
        { name: "totalUsers" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
        { name: "purchaseRevenue" },
        { name: "transactions" },
      ],
    };

    const [response] = await client.runReport(requestBody);

    const rows =
      response.rows?.map((row) => {
        // Parse date (YYYYMMDD) and format as "MMM dd, yyyy"
        const dateFormatted =
          row.dimensionValues && row.dimensionValues[0]?.value
            ? format(
                parse(
                  row.dimensionValues[0].value as string,
                  "yyyyMMdd",
                  new Date(),
                ),
                "MMM dd, yyyy",
              )
            : "Invalid Date";
        return {
          date: dateFormatted,
          sessions: row.metricValues?.[0]?.value ?? "0",
          totalUsers: row.metricValues?.[1]?.value ?? "0",
          bounceRate: row.metricValues?.[2]?.value ?? "0",
          avgSessionDuration: row.metricValues?.[3]?.value ?? "0",
          purchaseRevenue: row.metricValues?.[4]?.value ?? "0",
          transactions: row.metricValues?.[5]?.value ?? "0",
        };
      }) || [];

    return NextResponse.json({ rows }, { status: 200 });
  } catch (error) {
    console.error("Error in GA analyze:", error);
    return NextResponse.json(
      { error: "An error occurred while analyzing data" },
      { status: 500 },
    );
  }
}
