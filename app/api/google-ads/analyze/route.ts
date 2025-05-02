import { NextRequest, NextResponse } from "next/server";
import { GoogleAdsApi } from "google-ads-api";
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

// Helper function to discover manager account IDs for a refresh token
async function discoverManagerAccounts(client: any, refreshToken: string) {
  try {
    console.log("[google-ads/analyze] Attempting to discover manager accounts");

    // Check redis cache for known manager accounts
    if (redis) {
      try {
        const cachedManagers = await redis.get(
          "google-ads:manager-accounts:" + refreshToken.slice(-8),
        );
        if (cachedManagers && Array.isArray(cachedManagers)) {
          console.log(
            `[google-ads/analyze] Using ${cachedManagers.length} cached manager accounts`,
          );
          return cachedManagers;
        }
      } catch (e) {
        console.error("[google-ads/analyze] Redis error:", e);
        // Continue without cache if Redis fails
      }
    }

    // Set a timeout for the API call to prevent hanging
    const accessibleCustomers = await withTimeout(
      client.listAccessibleCustomers(refreshToken),
      8000, // 8 second timeout for this specific operation
      "Manager account discovery took too long",
    );

    // Filter for likely manager accounts (typically have larger IDs and manage other accounts)
    // This is a heuristic - in a real implementation you might want a more sophisticated approach
    const managerIds = accessibleCustomers.resource_names
      .map((name: string) => name.split("/")[1])
      .filter((id: string) => id); // Remove any undefined/empty values

    console.log(
      `[google-ads/analyze] Found ${
        managerIds.length
      } potential manager accounts: ${managerIds.join(", ")}`,
    );

    // Cache the result for future use
    if (redis) {
      try {
        await redis.set(
          "google-ads:manager-accounts:" + refreshToken.slice(-8),
          managerIds,
          { ex: 86400 }, // Cache for 24 hours
        );
      } catch (e) {
        console.error("[google-ads/analyze] Redis cache error:", e);
      }
    }

    return managerIds;
  } catch (error) {
    console.error(
      "[google-ads/analyze] Error discovering manager accounts:",
      error,
    );
    return [];
  }
}

// New function to get client accounts under a specific manager
async function getClientAccountsForManager(
  client: any,
  refreshToken: string,
  managerId: string,
) {
  try {
    console.log(
      `[google-ads/analyze] Getting client accounts for manager ${managerId}`,
    );

    // Check cache first
    if (redis) {
      try {
        const cacheKey = `google-ads:manager-clients:${managerId}`;
        const cachedClients = await redis.get(cacheKey);
        if (cachedClients && Array.isArray(cachedClients)) {
          console.log(
            `[google-ads/analyze] Using ${cachedClients.length} cached client accounts for manager ${managerId}`,
          );
          return cachedClients;
        }
      } catch (e) {
        console.error("[google-ads/analyze] Redis error:", e);
      }
    }

    // Use GAQL query to get customer client information
    const customer = client.Customer({
      customer_id: managerId,
      refresh_token: refreshToken,
    });

    // This query gets all direct child accounts (level = 1)
    const query = `
      SELECT
        customer_client.client_customer,
        customer_client.level,
        customer_client.manager,
        customer_client.descriptive_name,
        customer_client.id
      FROM customer_client
      WHERE customer_client.level = 1
    `;

    // Set a timeout for this operation
    const response = await withTimeout(
      customer.query(query),
      10000, // 10 second timeout
      `Getting clients for manager ${managerId} took too long`,
    );

    // Extract client IDs from the response
    const clientIds = response
      .filter((row: any) => row.customer_client?.id)
      .map((row: any) => row.customer_client.id.toString());

    console.log(
      `[google-ads/analyze] Found ${clientIds.length} client accounts under manager ${managerId}`,
    );

    // Cache the client list
    if (redis && clientIds.length > 0) {
      try {
        await redis.set(`google-ads:manager-clients:${managerId}`, clientIds, {
          ex: 86400, // Cache for 24 hours
        });
      } catch (e) {
        console.error("[google-ads/analyze] Redis cache error:", e);
      }
    }

    return clientIds;
  } catch (error) {
    console.error(
      `[google-ads/analyze] Error getting clients for manager ${managerId}:`,
      error,
    );
    return [];
  }
}

// Modified helper function to check if an account is a manager account with better error handling
async function isManagerAccount(
  client: any,
  refreshToken: string,
  customerId: string,
) {
  try {
    console.log(
      `[google-ads/analyze] Checking if ${customerId} is a manager account`,
    );

    // Use a safe query that works on manager accounts - just getting the name
    const customer = client.Customer({
      customer_id: customerId,
      refresh_token: refreshToken,
    });

    const query = `
      SELECT customer.id, customer.manager, customer.descriptive_name
      FROM customer
      WHERE customer.id = ${customerId}
    `;

    const response = await withTimeout(
      customer.query(query),
      5000, // 5 second timeout
      `Manager status check for ${customerId} took too long`,
    );

    if (response && response.length > 0) {
      // Check if the account is a manager account
      const isManager = response[0].customer?.manager === true;
      console.log(
        `[google-ads/analyze] Account ${customerId} is ${
          isManager ? "a manager account" : "a client account"
        }`,
      );
      return isManager;
    }
    return false;
  } catch (error: unknown) {
    console.error(
      `[google-ads/analyze] Error checking manager status: ${JSON.stringify(
        error,
      )}`,
    );
    // If we get "not found" error, it might be a client account needing a manager login
    if (
      error instanceof Error &&
      (error.message?.includes("not found") ||
        error.message?.includes("permission") ||
        error.message?.includes("access"))
    ) {
      console.log(
        "[google-ads/analyze] This appears to be a client account that needs manager credentials",
      );
      return false; // Not a manager, but a client account
    }
    return false; // Assume not a manager account if we can't determine
  }
}

// Known client-manager relationships to avoid expensive lookups
// This could also be stored in a database for dynamically growing relationships
const KNOWN_CLIENT_MANAGERS: Record<string, string> = {
  // Format: "clientId": "managerId"
  // Vloe Manager clients
  "9252611272": "9288644403", // Evos Boutiques is under Vloe Manager
  "2915525598": "9288644403", // Another client under Vloe Manager
  "6062950441": "9288644403", // Adding your new client account under the same manager
  // You can add more known relationships here as they're discovered
};

// Vloe Manager special optimization - all Vloe Manager's clients
// If we see a permission error for an unknown client, we'll try this manager first
const VLOE_MANAGER_ID = "9288644403";

// Direct access function to fetch client data using appropriate credentials
async function executeQueryWithBestCredentials(
  client: any,
  refreshToken: string,
  customerId: string,
  query: string,
) {
  console.log(
    `[google-ads/analyze] Trying to execute query for customer: ${customerId}`,
  );

  // First, check Redis cache for any previously discovered manager for this client
  if (redis) {
    try {
      const cachedManagerId = await redis.get(
        `google-ads:client-manager:${customerId}`,
      );
      if (cachedManagerId && typeof cachedManagerId === "string") {
        console.log(
          `[google-ads/analyze] Using cached manager ${cachedManagerId} for client ${customerId}`,
        );
        try {
          const customer = client.Customer({
            customer_id: customerId,
            login_customer_id: cachedManagerId,
            refresh_token: refreshToken,
          });

          const response = await customer.query(query);
          console.log(
            `[google-ads/analyze] Query successful using cached manager relationship`,
          );
          return response;
        } catch (error) {
          console.error(
            `[google-ads/analyze] Cached manager relationship failed:`,
            error,
          );
          // Remove the failed cached relationship
          await redis.del(`google-ads:client-manager:${customerId}`);
          // Continue to other methods
        }
      }
    } catch (e) {
      console.error("[google-ads/analyze] Redis error:", e);
      // Continue without cache if Redis fails
    }
  }

  // Check if this is a known client with a known manager
  const knownManagerId = KNOWN_CLIENT_MANAGERS[customerId];

  if (knownManagerId) {
    try {
      console.log(
        `[google-ads/analyze] Using known manager relationship: client ${customerId} under manager ${knownManagerId}`,
      );
      const customer = client.Customer({
        customer_id: customerId,
        login_customer_id: knownManagerId,
        refresh_token: refreshToken,
      });

      console.log(
        `[google-ads/analyze] Executing query with known manager login_customer_id: ${knownManagerId}`,
      );
      const response = await customer.query(query);
      console.log(
        `[google-ads/analyze] Query successful using known manager relationship`,
      );

      // Cache this manager relationship for future use
      if (redis) {
        try {
          await redis.set(
            `google-ads:client-manager:${customerId}`,
            knownManagerId,
            { ex: 2592000 },
          ); // Cache for 30 days
        } catch (e) {
          console.error("[google-ads/analyze] Redis cache error:", e);
        }
      }

      return response;
    } catch (error) {
      console.error(
        `[google-ads/analyze] Failed with known manager relationship:`,
        error,
      );
      // Fall through to other methods if this fails
    }
  }

  // Try direct access
  try {
    console.log(
      `[google-ads/analyze] Trying direct access for customer ${customerId}`,
    );
    const customer = client.Customer({
      customer_id: customerId,
      refresh_token: refreshToken,
    });

    const response = await customer.query(query);
    console.log(
      `[google-ads/analyze] Direct access successful for customer ${customerId}`,
    );
    return response;
  } catch (directError: any) {
    console.error(`[google-ads/analyze] Direct access failed:`, directError);

    // Check if the error indicates a permission issue requiring a manager login_customer_id
    const isPermissionError =
      directError.message?.includes("User doesn't have permission") ||
      directError.message?.includes("login-customer-id") ||
      (directError.errors &&
        directError.errors.some(
          (e: any) =>
            e.error_code?.authorization_error === "USER_PERMISSION_DENIED" ||
            e.message?.includes("login-customer-id"),
        ));

    if (isPermissionError) {
      // Permission error - this is likely a client account under a manager
      console.log(
        "[google-ads/analyze] Permission error detected - trying special optimizations",
      );

      // Special optimization for Vloe Manager accounts - try Vloe Manager first
      try {
        console.log(
          `[google-ads/analyze] Trying Vloe Manager (${VLOE_MANAGER_ID}) as a shortcut`,
        );
        const customer = client.Customer({
          customer_id: customerId,
          login_customer_id: VLOE_MANAGER_ID,
          refresh_token: refreshToken,
        });

        const response = await withTimeout(
          customer.query(query),
          8000, // 8 second timeout
          `Query with Vloe Manager for ${customerId} took too long`,
        );

        console.log(
          `[google-ads/analyze] Vloe Manager shortcut successful for ${customerId}`,
        );

        // Cache this relationship
        if (redis) {
          try {
            await redis.set(
              `google-ads:client-manager:${customerId}`,
              VLOE_MANAGER_ID,
              {
                ex: 2592000, // Cache for 30 days
              },
            );

            // Also update in-memory mapping for future use in this session
            KNOWN_CLIENT_MANAGERS[customerId] = VLOE_MANAGER_ID;
          } catch (e) {
            console.error("[google-ads/analyze] Redis cache error:", e);
          }
        }

        return response;
      } catch (vloeError) {
        console.log(
          "[google-ads/analyze] Vloe Manager shortcut didn't work, continuing with discovery",
        );
      }
    }

    // If direct access fails or Vloe shortcut doesn't work, try to discover manager accounts and use them
    let managerIds: string[] = [];

    // Try to find appropriate manager account with a timeout
    try {
      console.log(`[google-ads/analyze] Attempting to find a manager account`);

      // Get list of manager accounts with timeout protection
      managerIds = await withTimeout(
        discoverManagerAccounts(client, refreshToken),
        10000, // 10 second timeout
        "Manager account discovery took too long",
      );

      if (managerIds.length > 0) {
        // Try each manager account until one works (with a faster timeout per attempt)
        for (const managerId of managerIds) {
          try {
            console.log(
              `[google-ads/analyze] Trying with login_customer_id: ${managerId}`,
            );

            // First, check if we already know client accounts for this manager
            let isClientOfThisManager = false;

            // Get client accounts for this manager
            const managerClients = await getClientAccountsForManager(
              client,
              refreshToken,
              managerId,
            );

            // Check if the client is in this manager's client list
            if (managerClients.includes(customerId)) {
              isClientOfThisManager = true;
              console.log(
                `[google-ads/analyze] Discovered ${customerId} is a client of manager ${managerId}`,
              );
            }

            // If we confirmed it's a client, or if we couldn't determine, try querying with this manager
            if (isClientOfThisManager || managerClients.length === 0) {
              const customer = client.Customer({
                customer_id: customerId,
                login_customer_id: managerId,
                refresh_token: refreshToken,
              });

              // Set a timeout for the query attempt
              const response = await withTimeout(
                customer.query(query),
                5000, // 5 second timeout per manager attempt
                `Query with manager ${managerId} took too long`,
              );

              // If successful, store this relationship for future use
              console.log(
                `[google-ads/analyze] Found working manager ${managerId} for client ${customerId}`,
              );

              // Update in-memory mapping
              KNOWN_CLIENT_MANAGERS[customerId] = managerId;

              // Cache this manager relationship
              if (redis) {
                try {
                  await redis.set(
                    `google-ads:client-manager:${customerId}`,
                    managerId,
                    { ex: 2592000 },
                  ); // Cache for 30 days
                } catch (e) {
                  console.error("[google-ads/analyze] Redis cache error:", e);
                }
              }

              return response;
            }
          } catch (managerError) {
            console.error(
              `[google-ads/analyze] Manager ${managerId} access failed:`,
              managerError,
            );
            // Continue to next manager
          }
        }
      }
    } catch (discoveryError) {
      console.error(
        `[google-ads/analyze] Manager discovery failed:`,
        discoveryError,
      );
    }

    // If all attempts fail, throw the original error
    throw directError;
  }
}

// Set Node.js runtime and max duration
export const runtime = "nodejs";
export const maxDuration = 50; // Increased to match vercel.json

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

    // First, check if this is a manager account - this is fast and should complete
    try {
      const isManager = await isManagerAccount(
        client,
        refreshToken,
        customerId,
      );
      if (isManager) {
        console.error(
          `[google-ads/analyze] ${customerId} is a manager account - cannot query metrics directly`,
        );
        return NextResponse.json(
          {
            error: "Manager Account Detected",
            details:
              "You've entered a Google Ads Manager Account ID. Manager accounts don't contain campaign metrics directly. Please use one of the client account IDs managed by this account instead.",
          },
          { status: 400 },
        );
      }
    } catch (error) {
      // If checking manager status fails, continue as we'll try all access methods
      console.log(
        "[google-ads/analyze] Error checking manager status, continuing with query process",
      );
    }

    // Initial query to get campaign metrics
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

    try {
      // Our new optimized function to try all access methods efficiently
      const queryResponse = await executeQueryWithBestCredentials(
        client,
        refreshToken,
        customerId,
        query,
      );

      return processResults(queryResponse);
    } catch (error) {
      console.error("[google-ads/analyze] All access attempts failed:", error);
      return handleApiError(error);
    }

    // Helper function to process successful query results
    function processResults(queryResponse: any[]) {
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
    }

    // Helper function to handle API errors
    function handleApiError(apiError: any) {
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
          "Permission denied. Your account may not have access to this customer ID. If this is an account under a Google Ads Manager, ensure your Google account has proper access rights.";
      } else if (
        apiError.message?.includes("not found") ||
        apiError.message?.includes("invalid customer")
      ) {
        statusCode = 404;
        errorMessage =
          "Customer ID not found or invalid. Please verify the customer ID. If this is an account under a Google Ads Manager, ensure your Google account has proper access permissions.";
      } else if (
        errorMessages.includes("not associated with any Ads accounts")
      ) {
        // Specific message for accounts without Ads access
        statusCode = 403;
        errorMessage =
          "The Google account that generated the OAuth access tokens is not associated with any Ads accounts. Create a new Ads account, or add your Google account to an existing Ads account.";
      } else if (
        apiError.message?.includes(
          "Metrics cannot be requested for a manager account",
        )
      ) {
        statusCode = 400;
        errorMessage =
          "You've entered a Google Ads Manager Account ID. Manager accounts don't contain campaign metrics directly. Please use one of the client account IDs managed by this account instead.";
      } else if (
        apiError.message?.includes("login-customer-id") ||
        errorMessages.includes("login-customer-id")
      ) {
        statusCode = 403;
        errorMessage =
          "This appears to be a client account under a manager. Please make sure you have access to the manager account that oversees this client account.";
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
