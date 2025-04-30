import { NextRequest, NextResponse } from "next/server";
import { GoogleAdsApi } from "google-ads-api";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Helper function to discover manager account IDs for a refresh token
async function discoverManagerAccounts(client: any, refreshToken: string) {
  try {
    console.log("[google-ads/analyze] Attempting to discover manager accounts");
    const accessibleCustomers =
      await client.listAccessibleCustomers(refreshToken);

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
    return managerIds;
  } catch (error) {
    console.error(
      "[google-ads/analyze] Error discovering manager accounts:",
      error,
    );
    return [];
  }
}

// New helper function to check if an account is a manager account
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

    const response = await customer.query(query);
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
  } catch (error) {
    console.error(
      `[google-ads/analyze] Error checking manager status: ${error}`,
    );
    return false; // Assume not a manager account if we can't determine
  }
}

// New function to find relationships between managers and clients
async function findManagerClientRelationships(
  client: any,
  refreshToken: string,
) {
  try {
    console.log("[google-ads/analyze] Finding manager-client relationships");
    // Get all accessible accounts first
    const accessibleCustomers =
      await client.listAccessibleCustomers(refreshToken);
    const customerIds = accessibleCustomers.resource_names
      .map((name: string) => name.split("/")[1])
      .filter((id: string) => id);

    // Find which ones are managers
    const managerIds: string[] = [];
    const relationships: Record<string, string[]> = {};

    for (const id of customerIds) {
      try {
        const customer = client.Customer({
          customer_id: id,
          refresh_token: refreshToken,
        });

        // Try to query customer client links to see if this is a manager
        const query = `
          SELECT
            customer_client_link.client_customer,
            customer_client_link.manager_link_id
          FROM
            customer_client_link
        `;

        const response = await customer.query(query);

        if (response && response.length > 0) {
          managerIds.push(id);

          // Map the manager to its clients
          interface CustomerClientLink {
            client_customer: string;
            manager_link_id: string;
          }

          interface CustomerClientLinkResponse {
            customer_client_link?: CustomerClientLink;
          }

          relationships[id] = response.map((link: CustomerClientLinkResponse) =>
            link.customer_client_link?.client_customer.split("/").pop(),
          );

          console.log(
            `[google-ads/analyze] Found manager ${id} with ${response.length} clients`,
          );
        }
      } catch (error) {
        // Skip errors - this account might not be a manager
        continue;
      }
    }

    return { managerIds, relationships };
  } catch (error) {
    console.error(
      "[google-ads/analyze] Error finding manager-client relationships:",
      error,
    );
    return { managerIds: [], relationships: {} };
  }
}

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

    // Check if the account is a manager account before attempting queries
    const isManager = await isManagerAccount(client, refreshToken, customerId);
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

    // Find manager accounts and their relationships with clients
    const { managerIds, relationships } = await findManagerClientRelationships(
      client,
      refreshToken,
    );
    console.log(
      `[google-ads/analyze] Found ${managerIds.length} manager accounts`,
    );

    // Determine which manager account manages this client (if any)
    let managerIdForClient = null;
    for (const managerId of managerIds) {
      if (
        relationships[managerId] &&
        relationships[managerId].includes(customerId)
      ) {
        managerIdForClient = managerId;
        console.log(
          `[google-ads/analyze] Found manager ${managerId} for client ${customerId}`,
        );
        break;
      }
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
      // If we found a specific manager for this client, try that first
      if (managerIdForClient) {
        console.log(
          `[google-ads/analyze] Attempting access via known manager account: ${managerIdForClient}`,
        );
        try {
          const customer = client.Customer({
            customer_id: customerId,
            login_customer_id: managerIdForClient,
            refresh_token: refreshToken,
          });

          console.log(
            `[google-ads/analyze] Executing query with login_customer_id: ${query}`,
          );
          const queryResponse = await customer.query(query);
          console.log(
            "[google-ads/analyze] Query successful using specific manager account",
          );

          return processResults(queryResponse);
        } catch (error) {
          console.error(
            `[google-ads/analyze] Access via known manager failed:`,
            error,
          );
          // Continue to try direct access
        }
      }

      // Try direct access next
      console.log("[google-ads/analyze] Attempting direct customer access");
      const customer = client.Customer({
        customer_id: customerId,
        refresh_token: refreshToken,
      });

      console.log(`[google-ads/analyze] Executing query: ${query}`);
      const queryResponse = await customer.query(query);

      // If we get here, direct access worked - process results normally
      return processResults(queryResponse);
    } catch (directAccessError: any) {
      console.error(
        "[google-ads/analyze] Direct access failed:",
        directAccessError,
      );

      // If this looks like a permission issue or account not found, try using manager accounts
      if (
        directAccessError.message?.includes("permission") ||
        directAccessError.message?.includes("access") ||
        directAccessError.message?.includes("not found")
      ) {
        // Discover potential manager accounts if we didn't already
        const allManagerIds =
          managerIds.length > 0
            ? managerIds
            : await discoverManagerAccounts(client, refreshToken);

        if (allManagerIds.length > 0) {
          console.log(
            `[google-ads/analyze] Attempting access through ${allManagerIds.length} manager accounts`,
          );

          // Try each manager account
          for (const managerId of allManagerIds) {
            try {
              console.log(
                `[google-ads/analyze] Trying with login_customer_id: ${managerId}`,
              );
              const customer = client.Customer({
                customer_id: customerId,
                login_customer_id: managerId, // Use the manager account ID as the login ID
                refresh_token: refreshToken,
              });

              const queryResponse = await customer.query(query);
              console.log(
                "[google-ads/analyze] Query successful using manager account",
              );

              // If successful, process results
              return processResults(queryResponse);
            } catch (managerError) {
              console.error(
                `[google-ads/analyze] Manager access failed for ${managerId}:`,
                managerError,
              );
              // Continue to next manager account
            }
          }

          // If we've tried all manager accounts and still failed
          console.error(
            "[google-ads/analyze] All manager access attempts failed",
          );
          return NextResponse.json(
            {
              error: "Access Denied",
              details:
                "You don't have permission to access this client account. If this is a client account under a manager, make sure your Google account has the proper access permissions.",
            },
            { status: 403 },
          );
        } else {
          console.error("[google-ads/analyze] No manager accounts found");
          return NextResponse.json(
            {
              error: "No Manager Accounts Found",
              details:
                "Your Google account doesn't have access to any manager accounts that could provide access to this client account.",
            },
            { status: 403 },
          );
        }

        // If we get here, we've tried direct access and all manager accounts without success
        console.error("[google-ads/analyze] All access attempts failed");
        return handleApiError(directAccessError);
      } else {
        // For other errors, just forward to error handler
        return handleApiError(directAccessError);
      }
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
