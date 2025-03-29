"use client";

import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { redirect } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";

export default function SignInButton() {
  const t = useTranslations("SignInButton");
  const { data: session, status } = useSession();
  const locale = useLocale();
  console.log(session, status);
  if (status === "loading") return null;
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
  return (
    // Sign in with Google
    <Button
      onClick={() =>
        signIn("google", {
          callbackUrl: `/${locale}/dashboard`,
          redirect: false,
        })
      }
      variant="secondary"
      size="lg"
    >
      {t("signIn")}
    </Button>
  );
}
