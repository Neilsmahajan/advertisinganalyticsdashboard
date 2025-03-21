"use client";

import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { redirect } from "next/navigation";

export default function SignOutButton() {
  const { data: session, status } = useSession();
  console.log(session, status);
  if (status === "loading") return null;
  if (status === "authenticated") {
    return (
      <Button
        variant="secondary"
        size="lg"
        onClick={() => redirect("/account")}
      >
        <Search className="mr-2 h-4 w-4" /> View your Queries
      </Button>
    );
  }
  return (
    <Button onClick={() => signIn()} variant="secondary" size="lg">
      Sign In
    </Button>
  );
}
