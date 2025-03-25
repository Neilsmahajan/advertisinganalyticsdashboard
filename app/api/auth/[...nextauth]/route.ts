import NextAuth from "next-auth";
import { DefaultSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      refreshToken?: string;
    } & DefaultSession["user"];
  }
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
