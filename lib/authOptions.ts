import type { DefaultSession, NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

// Extend session type to include Microsoft tokens.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      refreshToken?: string;
    } & DefaultSession["user"];
    microsoft?: {
      accessToken?: string;
      expiresIn?: number;
      extExpiresIn?: number;
      tokenType?: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/adwords openid",
          access_type: "offline",
          prompt: "consent",
          response_type: "code",
        },
      },
    }),
    // Azure AD provider added for connecting Microsoft account.
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET!,
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    jwt: async ({ token, account }: { token: any; account?: any }) => {
      if (account) {
        if (account.provider === "google") {
          token.accessToken = account.access_token;
          if (account.refresh_token) token.refreshToken = account.refresh_token;
        } else if (account.provider === "azure-ad") {
          token.microsoftAccessToken = account.access_token;
          token.microsoftExpiresIn = account.expires_in;
          token.microsoftExtExpiresIn = account.ext_expires_in;
          token.microsoftTokenType = account.token_type;
        }
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.refreshToken = token.refreshToken as string;
        // Check if an azure-ad account exists for this user
        const azureAccount = await prisma.account.findFirst({
          where: { userId: session.user.id, provider: "azure-ad" },
        });
        if (azureAccount) {
          session.microsoft = {
            accessToken: token.microsoftAccessToken as string | undefined,
            expiresIn: token.microsoftExpiresIn as number | undefined,
            extExpiresIn: token.microsoftExtExpiresIn as number | undefined,
            tokenType: token.microsoftTokenType as string | undefined,
          };
        } else {
          session.microsoft = undefined;
        }
      }
      return session;
    },
  },
};
