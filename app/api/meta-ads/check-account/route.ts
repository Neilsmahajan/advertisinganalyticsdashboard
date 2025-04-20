import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Redis } from "@upstash/redis";

// Create Redis client if credentials are available
let redis: Redis | null = null;
if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

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

    // Parse the query param to see if we should skip the slow API check
    const skipSlowCheck =
      request.nextUrl.searchParams.get("skipSlowCheck") === "true";
    const userId = session.user.id;

    // Check if we have a cached result
    if (redis) {
      try {
        const cachedStatus = await redis.get(`meta-ads-status:${userId}`);
        if (cachedStatus) {
          console.log("Returning cached Meta Ads status");
          return NextResponse.json(cachedStatus);
        }
      } catch (error) {
        console.error("Redis error:", error);
        // Continue without cache if Redis fails
      }
    }

    // Check if user has a Facebook account
    const facebookAccount = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: "facebook" },
    });

    if (!facebookAccount) {
      return NextResponse.json({
        status: "error",
        connected: false,
        message:
          "No Meta account connected. Please connect your Facebook/Meta account.",
        scope: null,
      });
    }

    // Check if the account has an access token
    if (!facebookAccount.access_token) {
      return NextResponse.json({
        status: "error",
        connected: true,
        hasAccessToken: false,
        message:
          "Meta account connected but missing access token. Please reconnect with the required permissions.",
        scope: facebookAccount.scope,
      });
    }

    // Log the actual scope for debugging - this helps us understand what's stored
    console.log(`Meta account scope: "${facebookAccount.scope}"`);

    // Instead of doing a strict scope check, we'll directly try to access the API
    // The actual permissions might be sufficient but stored differently
    // Skip straight to the API check which is more reliable

    if (skipSlowCheck) {
      return NextResponse.json({
        status: "pending", // Special status to indicate we haven't done the full check
        connected: true,
        hasAccessToken: true,
        hasRequiredScopes: true, // Assume true since we can't reliably check from the scope string
        message:
          "Basic connectivity check passed. Checking Meta Ads API access in the background...",
        scope: facebookAccount.scope,
      });
    }

    // Try to verify actual Meta Ads access by making a basic API call
    try {
      const accessToken = facebookAccount.access_token;

      // Make a simple API call to verify access - get the user's Ad accounts
      const apiUrl = `https://graph.facebook.com/v21.0/me/adaccounts?access_token=${accessToken}&fields=name,account_id,account_status&limit=5`;

      const response = await withTimeout(
        fetch(apiUrl),
        20000, // 20 second timeout for this specific operation
        "Meta Ads API call took too long",
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || "Unknown API error";

        // If we get a specific permission error, then we know the scope is insufficient
        const isPemissionError =
          errorMessage.includes("permission") ||
          errorMessage.includes("access") ||
          errorMessage.includes("scope") ||
          errorMessage.includes("authorize");

        const result = {
          status: "warning",
          connected: true,
          hasAccessToken: true,
          hasRequiredScopes: !isPemissionError, // Only false if API explicitly mentions permissions
          hasAdsAccounts: false,
          message: isPemissionError
            ? "Meta account connected but missing required permissions. Please reconnect with the required permissions."
            : `Error accessing Meta Ads: ${errorMessage}`,
          scope: facebookAccount.scope,
        };

        // Cache the error result for a shorter time
        if (redis) {
          await redis.set(`meta-ads-status:${userId}`, result, { ex: 600 }); // Cache for 10 minutes
        }

        return NextResponse.json(result);
      }

      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        const result = {
          status: "warning",
          connected: true,
          hasAccessToken: true,
          hasRequiredScopes: true, // If we got here, permissions are sufficient
          hasAdsAccounts: false,
          message:
            "Your Meta account is not associated with any Ad accounts. You need to create a Meta Ad account or be added to an existing one.",
          scope: facebookAccount.scope,
        };

        // Cache the result
        if (redis) {
          await redis.set(`meta-ads-status:${userId}`, result, { ex: 3600 }); // Cache for 1 hour
        }

        return NextResponse.json(result);
      }

      // Account has access to Meta Ads accounts
      const result = {
        status: "success",
        connected: true,
        hasAccessToken: true,
        hasRequiredScopes: true, // If we got here, permissions are sufficient
        hasAdsAccounts: true,
        adsAccountsCount: data.data.length,
        message: `Meta account properly connected with access to ${data.data.length} Ad account(s).`,
        scope: facebookAccount.scope,
      };

      // Cache the successful result
      if (redis) {
        await redis.set(`meta-ads-status:${userId}`, result, { ex: 3600 }); // Cache for 1 hour
      }

      return NextResponse.json(result);
    } catch (error: any) {
      console.error("Error verifying Meta Ads access:", error);

      // Check if it's a timeout error
      const isTimeout =
        error.message && error.message.includes("Timeout after");

      const result = {
        status: "warning",
        connected: true,
        hasAccessToken: true,
        hasRequiredScopes: true, // Assume permissions might be OK since we can't tell
        hasAdsAccounts: false,
        message: isTimeout
          ? "Meta Ads API is taking too long to respond. Please try again later."
          : "Could not verify Meta Ads access: " +
            (error.message || "Unknown error"),
        scope: facebookAccount.scope,
      };

      // Even for errors, we can cache the result to avoid repeated timeout issues
      if (redis && isTimeout) {
        await redis.set(`meta-ads-status:${userId}`, result, { ex: 600 }); // Cache for 10 minutes
      }

      return NextResponse.json(result);
    }
  } catch (error) {
    console.error("Error checking Meta account status:", error);
    return NextResponse.json(
      { error: "An error occurred while checking account status" },
      { status: 500 },
    );
  }
}
