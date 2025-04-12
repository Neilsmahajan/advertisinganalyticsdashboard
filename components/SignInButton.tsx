"use client";

import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { redirect } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function SignInButton() {
  const t = useTranslations("SignInButton");
  const { data: session, status } = useSession();
  const locale = useLocale();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Handle sign in and show loading state
  const handleSignIn = async () => {
    setIsSigningIn(true);
    await signIn("google", {
      callbackUrl: `/${locale}/dashboard`,
      redirect: false,
    });
    // Note: We don't need to reset the state as the page will redirect or refresh
  };

  // Show a loading button during initial session check
  if (status === "loading") {
    return (
      <Button variant="secondary" size="lg" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {t("loading")}
      </Button>
    );
  }

  // Show account button for authenticated users
  if (status === "authenticated") {
    return (
      <Button
        variant="secondary"
        size="lg"
        onClick={() => {
          redirect({ href: "/account", locale });
        }}
      >
        <Search className="mr-2 h-4 w-4" /> {t("viewYourQueries")}
      </Button>
    );
  }

  // Show sign in button for unauthenticated users
  return (
    <Button
      onClick={handleSignIn}
      variant="secondary"
      size="lg"
      disabled={isSigningIn}
    >
      {isSigningIn ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t("signingIn")}
        </>
      ) : (
        t("signIn")
      )}
    </Button>
  );
}
