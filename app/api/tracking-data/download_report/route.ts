import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    let browser;
    const data = await request.json();
    const { userInfo, queryInfo, results, service, locale } = data;

    if (!userInfo || !queryInfo || !results || !service) {
      return NextResponse.json(
        { error: "userInfo, queryInfo, results, and service are required" },
        { status: 400 },
      );
    }
    if (service !== "Tracking Data") {
      return NextResponse.json(
        { error: "Unsupported service for this report endpoint" },
        { status: 400 },
      );
    }

    // Extract locale and set translations
    const lowerLocale = (locale || "en").toLowerCase();
    const reportTitle = lowerLocale === "fr" ? "Rapport" : "Report";
    const userInfoLabel =
      lowerLocale === "fr"
        ? "Informations sur l'utilisateur"
        : "User Information";
    const nameLabel = lowerLocale === "fr" ? "Nom" : "Name";
    const emailLabel = lowerLocale === "fr" ? "Courriel" : "Email";
    const queryInfoLabel =
      lowerLocale === "fr"
        ? "Informations sur la requête"
        : "Query Information";
    const serviceLabel = lowerLocale === "fr" ? "Service" : "Service";
    const queryNameLabel =
      lowerLocale === "fr" ? "Nom de la requête" : "Query Name";
    const queryDataLabel =
      lowerLocale === "fr" ? "Données de la requête" : "Query Data";
    const resultsLabel = lowerLocale === "fr" ? "Résultats:" : "Results:";

    const queryData = queryInfo.queryData;
    const query_data_html =
      queryData && typeof queryData === "object"
        ? Object.entries(queryData)
            .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
            .join("")
        : "";

    // For Tracking Data service, build a simple unordered list of tags and (optional) descriptions.
    const results_html = `
      <ul>
        ${(results.analytics_tags || [])
          .map(
            (tag: string) =>
              `<li>${tag}: ${
                results.tag_descriptions
                  ? results.tag_descriptions[tag] || ""
                  : ""
              }</li>`,
          )
          .join("")}
      </ul>
    `;

    const html_content = `
      <html>
      <head>
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          body { font-family: Arial, sans-serif; font-size: 10px; }
          h1 { color: #00BFFF; font-size: 14px; }
          .section { margin-bottom: 20px; }
          .section h2 { color: #47adbf; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; word-wrap: break-word; font-size: 10px; }
          th, td { padding: 4px; text-align: left; border: 1px solid #ddd; }
          th { background-color: #47adbf; color: white; }
          pre { white-space: pre-wrap; word-wrap: break-word; font-size: 10px; }
        </style>
      </head>
      <body>
        <h1>${reportTitle}</h1>
        <div class="section">
          <h2>${userInfoLabel}</h2>
          <p>${nameLabel}: ${userInfo.name}</p>
          <p>${emailLabel}: ${userInfo.email}</p>
        </div>
        <div class="section">
          <h2>${queryInfoLabel}</h2>
          <p><strong>${serviceLabel}:</strong> ${queryInfo.service}</p>
          <p><strong>${queryNameLabel}:</strong> ${queryInfo.queryName}</p>
          <div>${query_data_html}</div>
        </div>
        <div class="section">
          <h2>${resultsLabel}</h2>
          ${results_html}
        </div>
      </body>
      </html>
    `;

    try {
      let pdfBuffer;

      if (process.env.NODE_ENV === "production") {
        // In production (Vercel), use Browserless.io API for PDF generation
        // This avoids the need for system dependencies in the serverless environment
        const browserlessAPIUrl =
          process.env.BROWSERLESS_API_URL ||
          "https://chrome.browserless.io/pdf";
        const browserlessAPIKey = process.env.BROWSERLESS_API_KEY;

        if (!browserlessAPIKey) {
          throw new Error(
            "BROWSERLESS_API_KEY environment variable is required in production",
          );
        }

        const response = await fetch(
          `${browserlessAPIUrl}?token=${browserlessAPIKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              html: html_content,
              options: {
                format: "A4",
                landscape: true,
                printBackground: true,
                margin: {
                  top: "10mm",
                  right: "10mm",
                  bottom: "10mm",
                  left: "10mm",
                },
              },
            }),
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Browserless API error: ${response.status} ${errorText}`,
          );
        }

        pdfBuffer = Buffer.from(await response.arrayBuffer());
      } else {
        // In development, use regular puppeteer
        const puppeteer = require("puppeteer");
        browser = await puppeteer.launch({
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
          headless: true,
        });

        const page = await browser.newPage();
        await page.setContent(html_content, { waitUntil: "networkidle0" });
        pdfBuffer = await page.pdf({ format: "a4", landscape: true });
        await browser.close();
      }

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=report.pdf",
        },
      });
    } catch (error) {
      console.error("Browser/PDF generation error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      {
        error: "Error generating report",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
