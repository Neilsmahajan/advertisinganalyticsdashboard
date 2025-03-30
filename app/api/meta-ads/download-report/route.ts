import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { userInfo, queryInfo, results, service, locale } = data;
    if (!userInfo || !queryInfo || !results || !service) {
      return NextResponse.json(
        { error: "userInfo, queryInfo, results, and service are required" },
        { status: 400 },
      );
    }

    const lowerLocale = (locale || "en").toLowerCase();
    let reportTitle,
      userInfoLabel,
      nameLabel,
      emailLabel,
      queryInfoLabel,
      serviceLabel,
      queryNameLabel,
      queryDataLabel,
      resultsLabel;
    if (lowerLocale === "fr") {
      reportTitle = "Rapport";
      userInfoLabel = "Informations sur l'utilisateur";
      nameLabel = "Nom";
      emailLabel = "Courriel";
      queryInfoLabel = "Informations sur la requête";
      serviceLabel = "Service";
      queryNameLabel = "Nom de la requête";
      queryDataLabel = "Données de la requête";
      resultsLabel = "Résultats:";
    } else {
      reportTitle = "Report";
      userInfoLabel = "User Information";
      nameLabel = "Name";
      emailLabel = "Email";
      queryInfoLabel = "Query Information";
      serviceLabel = "Service";
      queryNameLabel = "Query Name";
      queryDataLabel = "Query Data";
      resultsLabel = "Results:";
    }

    const queryDataObj = (queryInfo.queryData as Record<string, unknown>) || {};
    const queryDataHtml = Object.entries(queryDataObj)
      .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
      .join("");

    // Build HTML for the Meta Ads report
    const campaignsHtml =
      results.campaigns && results.campaigns.length > 0
        ? `
      <h3 style="color:#47adbf; margin-bottom:10px;">Campaign Details</h3>
      <table style="width:100%; border-collapse:collapse;">
        <thead>
          <tr>
            <th style="padding:8px; background-color:#47adbf; color:white; border:1px solid #ddd;">Campaign Name</th>
            <th style="padding:8px; background-color:#47adbf; color:white; border:1px solid #ddd;">Impressions</th>
            <th style="padding:8px; background-color:#47adbf; color:white; border:1px solid #ddd;">Clicks</th>
            <th style="padding:8px; background-color:#47adbf; color:white; border:1px solid #ddd;">Spend</th>
            <th style="padding:8px; background-color:#47adbf; color:white; border:1px solid #ddd;">Reach</th>
          </tr>
        </thead>
        <tbody>
          ${results.campaigns
            .map(
              (c: any) => `
            <tr>
              <td style="padding:8px; border:1px solid #ddd;">${
                c.name || ""
              }</td>
              <td style="padding:8px; border:1px solid #ddd;">${
                c.impressions || 0
              }</td>
              <td style="padding:8px; border:1px solid #ddd;">${
                c.clicks || 0
              }</td>
              <td style="padding:8px; border:1px solid #ddd;">${
                c.cost || "$0.00"
              }</td>
              <td style="padding:8px; border:1px solid #ddd;">${
                c.reach || 0
              }</td>
            </tr>`,
            )
            .join("")}
        </tbody>
      </table>
      `
        : "<p>No campaign data available.</p>";

    const htmlContent = `
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
            <div>${queryDataHtml}</div>
          </div>
          <div class="section">
            <h2>${resultsLabel}</h2>
            ${campaignsHtml}
          </div>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", landscape: true });
    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=meta-ads-report.pdf",
      },
    });
  } catch (error) {
    console.error("Error generating Meta Ads report:", error);
    return NextResponse.json(
      { error: "An error occurred while generating report" },
      { status: 500 },
    );
  }
}
