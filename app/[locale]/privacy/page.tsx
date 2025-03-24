import { getTranslations } from "next-intl/server";

export default async function PrivacyPage() {
  const t = await getTranslations("Privacy");
  return (
    <div className="container px-4 py-12 md:px-6 md:py-20">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            {t("pageTitle")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 md:text-lg">
            {t("introText")}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t("sectionInformationTitle")}</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-500 dark:text-gray-400">
            <li>{t("informationPersonalInfo")}</li>
            <li>{t("informationUsageData")}</li>
            <li>{t("informationAdPlatformData")}</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t("sectionUseInfoTitle")}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t("useInfoDescription")}
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-500 dark:text-gray-400">
            <li>{t("useInfoItem1")}</li>
            <li>{t("useInfoItem2")}</li>
            <li>{t("useInfoItem3")}</li>
            <li>{t("useInfoItem4")}</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">
            {t("sectionDataProtectionTitle")}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t("dataProtectionDescription")}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t("sectionSharingTitle")}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t("sharingDescription")}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t("sectionYourRightsTitle")}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t("yourRightsDescription")}
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-500 dark:text-gray-400">
            <li>{t("rightItem1")}</li>
            <li>{t("rightItem2")}</li>
            <li>{t("rightItem3")}</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t("sectionChangesTitle")}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t("changesDescription")}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t("sectionContactTitle")}</h2>
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
