"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <Button
      onClick={() => signOut({ callbackUrl: "/" })}
      variant="destructive"
      className="w-full mt-4"
    >
      <LogOut className="mr-2 h-4 w-4" /> Sign Out
    </Button>
  );
}
