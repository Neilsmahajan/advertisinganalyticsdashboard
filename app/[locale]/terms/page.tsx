import { getTranslations } from "next-intl/server";

export default async function TermsPage() {
  const t = await getTranslations("Terms");
  return (
    <div className="container px-4 py-12 md:px-6 md:py-20">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Page header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            {t("pageTitle")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 md:text-lg">
            {t("introText")}
          </p>
        </div>

        {/* Acceptance of Terms */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t("acceptanceTitle")}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t("acceptanceDescription")}
          </p>
        </div>

        {/* User Responsibilities */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">
            {t("userResponsibilitiesTitle")}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t("userResponsibilitiesDescription")}
          </p>
        </div>

        {/* Modifications to the Service */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t("modificationsTitle")}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t("modificationsDescription")}
          </p>
        </div>

        {/* Limitation of Liability */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t("limitationTitle")}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t("limitationDescription")}
          </p>
        </div>

        {/* Changes to These Terms */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t("changesTitle")}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t("changesDescription")}
          </p>
        </div>

        {/* Contact Us */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t("contactTitle")}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t("contactDescription")}{" "}
            <a href="/contact" className="text-primary hover:underline">
              {t("contactLinkText")}
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
