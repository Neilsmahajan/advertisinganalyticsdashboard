import { DefaultSession } from "next-auth";
import { handlers } from "@/auth";
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      refreshToken?: string;
    } & DefaultSession["user"];
  }
}

export const { GET, POST } = handlers;
