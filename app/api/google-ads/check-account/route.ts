import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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

    return NextResponse.json({
      status: "success",
      connected: true,
      hasRefreshToken: true,
      hasRequiredScopes: true,
      message:
        "Google account properly connected with all required permissions.",
      scope: googleAccount.scope,
    });
  } catch (error) {
    console.error("Error checking Google account status:", error);
    return NextResponse.json(
      { error: "An error occurred while checking account status" },
      { status: 500 },
    );
  }
}
