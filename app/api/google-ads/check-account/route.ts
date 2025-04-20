import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GoogleAdsApi } from "google-ads-api";

// Helper function to add timeout to a promise
const withTimeout = (
  promise: Promise<any>,
  ms: number,
  errorMessage: string,
) => {
  const timeout = new Promise<never>((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(`Timeout after ${ms}ms: ${errorMessage}`));
    }, ms);
  });

  return Promise.race([promise, timeout]);
};

export const runtime = "nodejs"; // Explicitly set Node.js runtime
export const maxDuration = 30; // Set maximum duration to 30 seconds

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has a Google account
    const googleAccount = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: "google" },
    });

    if (!googleAccount) {
      return NextResponse.json({
        status: "error",
        connected: false,
        message:
          "No Google account connected. Please connect your Google account.",
        scope: null,
      });
    }

    // Check if the account has a refresh token
    if (!googleAccount.refresh_token) {
      return NextResponse.json({
        status: "error",
        connected: true,
        hasRefreshToken: false,
        message:
          "Google account connected but missing refresh token. Please reconnect with the required permissions.",
        scope: googleAccount.scope,
      });
    }

    // Check if the account has the required scopes
    const requiredScopes = ["https://www.googleapis.com/auth/adwords"];
    const accountScopes = googleAccount.scope?.split(" ") || [];
    const hasRequiredScopes = requiredScopes.every((scope) =>
      accountScopes.includes(scope),
    );

    if (!hasRequiredScopes) {
      return NextResponse.json({
        status: "warning",
        connected: true,
        hasRefreshToken: true,
        hasRequiredScopes: false,
        message:
          "Google account connected but missing required permissions. Please reconnect with the required permissions.",
        scope: googleAccount.scope,
      });
    }

    // Try to verify actual Google Ads access by making a basic API call
    try {
      // Check for required environment variables
      if (
        !process.env.GOOGLE_CLIENT_ID ||
        !process.env.GOOGLE_CLIENT_SECRET ||
        !process.env.GOOGLE_ADS_DEVELOPER_TOKEN
      ) {
        return NextResponse.json(
          {
            status: "error",
            message:
              "Server configuration issue: Missing required environment variables.",
          },
          { status: 500 },
        );
      }

      const client = new GoogleAdsApi({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
      });

      // Use the search accessible customers method with a timeout
      // Give it 20 seconds max to complete, leaving some buffer for the function
      const accessibleCustomers = await withTimeout(
        client.listAccessibleCustomers(googleAccount.refresh_token),
        20000, // 20 second timeout for this specific operation
        "Google Ads API call took too long",
      );

      if (
        !accessibleCustomers ||
        accessibleCustomers.resource_names.length === 0
      ) {
        return NextResponse.json({
          status: "warning",
          connected: true,
          hasRefreshToken: true,
          hasRequiredScopes: true,
          hasAdsAccounts: false,
          message:
            "Your Google account is not associated with any Google Ads accounts. You need to create a Google Ads account or be added to an existing one.",
          scope: googleAccount.scope,
        });
      }

      // Account has access to Google Ads accounts
      return NextResponse.json({
        status: "success",
        connected: true,
        hasRefreshToken: true,
        hasRequiredScopes: true,
        hasAdsAccounts: true,
        adsAccountsCount: accessibleCustomers.resource_names.length,
        message: `Google account properly connected with access to ${accessibleCustomers.resource_names.length} Google Ads account(s).`,
        scope: googleAccount.scope,
      });
    } catch (error: any) {
      console.error("Error verifying Google Ads access:", error);

      // Check if it's a timeout error
      const isTimeout =
        error.message && error.message.includes("Timeout after");

      return NextResponse.json({
        status: "warning",
        connected: true,
        hasRefreshToken: true,
        hasRequiredScopes: true,
        hasAdsAccounts: false,
        message: isTimeout
          ? "Google Ads API is taking too long to respond. Please try again later."
          : "Could not verify Google Ads access: " +
            (error.message || "Unknown error"),
        scope: googleAccount.scope,
      });
    }
  } catch (error) {
    console.error("Error checking Google account status:", error);
    return NextResponse.json(
      { error: "An error occurred while checking account status" },
      { status: 500 },
    );
  }
}
