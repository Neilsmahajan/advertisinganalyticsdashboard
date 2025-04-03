import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { userInfo, queryInfo, results, service, locale, translatedHeaders } =
      data;
    if (!userInfo || !queryInfo || !results || !service) {
      return NextResponse.json(
        { error: "userInfo, queryInfo, results, and service are required" },
        { status: 400 },
      );
    }
    if (service !== "Google Analytics") {
      return NextResponse.json(
        { error: "Unsupported service for this report endpoint" },
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

    const queryDataObj = queryInfo.queryData;
    const query_data_html =
      queryDataObj && typeof queryDataObj === "object"
        ? Object.entries(queryDataObj)
            .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
            .join("")
        : "";

    // Build table HTML for Google Analytics results
    let tableHeaders = "";
    let tableRows = "";
    if (translatedHeaders) {
      tableHeaders = `
	      <th style="padding:8px; background-color:#47adbf; color:white; border:1px solid #ddd;">${
          translatedHeaders.date || "Date"
        }</th>
	      <th style="padding:8px; background-color:#47adbf; color:white; border:1px solid #ddd;">${
          translatedHeaders.sessions || "Sessions"
        }</th>
	      <th style="padding:8px; background-color:#47adbf; color:white; border:1px solid #ddd;">${
          translatedHeaders.totalUsers || "Total Users"
        }</th>
	      <th style="padding:8px; background-color:#47adbf; color:white; border:1px solid #ddd;">${
          translatedHeaders.bounceRate || "Bounce Rate"
        }</th>
	      <th style="padding:8px; background-color:#47adbf; color:white; border:1px solid #ddd;">${
          translatedHeaders.avgSessionDuration || "Avg. Session Duration"
        }</th>
	      <th style="padding:8px; background-color:#47adbf; color:white; border:1px solid #ddd;">${
          translatedHeaders.purchaseRevenue || "Purchase Revenue"
        }</th>
	      <th style="padding:8px; background-color:#47adbf; color:white; border:1px solid #ddd;">${
          translatedHeaders.transactions || "Transactions"
        }</th>
	    `;
    } else {
      tableHeaders = `
	      <th style="padding:8px; border:1px solid #ddd;">Date</th>
	      <th style="padding:8px; border:1px solid #ddd;">Sessions</th>
	      <th style="padding:8px; border:1px solid #ddd;">Total Users</th>
	      <th style="padding:8px; border:1px solid #ddd;">Bounce Rate</th>
	      <th style="padding:8px; border:1px solid #ddd;">Avg. Session Duration</th>
	      <th style="padding:8px; border:1px solid #ddd;">Purchase Revenue</th>
	      <th style="padding:8px; border:1px solid #ddd;">Transactions</th>
	    `;
    }

    if (results.rows && Array.isArray(results.rows)) {
      tableRows = results.rows
        .map(
          (row: any) => `
	      <tr>
	        <td style="padding:8px; border:1px solid #ddd;">${row.date}</td>
	        <td style="padding:8px; border:1px solid #ddd;">${row.sessions}</td>
	        <td style="padding:8px; border:1px solid #ddd;">${row.totalUsers}</td>
	        <td style="padding:8px; border:1px solid #ddd;">${row.bounceRate}</td>
	        <td style="padding:8px; border:1px solid #ddd;">${row.avgSessionDuration}</td>
	        <td style="padding:8px; border:1px solid #ddd;">${row.purchaseRevenue}</td>
	        <td style="padding:8px; border:1px solid #ddd;">${row.transactions}</td>
	      </tr>
	    `,
        )
        .join("");
    }

    const results_table_html = `
	    <table style="width:100%; border-collapse:collapse; table-layout:fixed; word-wrap:break-word;">
	      <thead>
	        <tr>
	          ${tableHeaders}
	        </tr>
	      </thead>
	      <tbody>
	        ${tableRows}
	      </tbody>
	    </table>
	  `;

    const html_content = `
	    <html>
	    <head>
	      <style>
	        @page { 
	          size: A4 landscape; 
	          margin: 10mm; 
	        }
	        body { 
	          font-family: Arial, sans-serif; 
	          font-size: 10px; 
	        }
	        h1 { 
	          color: #00BFFF; 
	          font-size: 14px; 
	        }
	        .section { 
	          margin-bottom: 20px; 
	        }
	        .section h2 { 
	          color: #47adbf; 
	          font-size: 12px; 
	        }
	        table { 
	          width: 100%; 
	          border-collapse: collapse; 
	          table-layout: fixed; 
	          word-wrap: break-word; 
	          font-size: 10px; 
	        }
	        th, td { 
	          padding: 4px; 
	          text-align: left; 
	          border: 1px solid #ddd; 
	        }
	        pre { 
	          white-space: pre-wrap; 
	          word-wrap: break-word; 
	          font-size: 10px; 
	        }
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
	        ${results_table_html}
	      </div>
	    </body>
	    </html>
	  `;

    let browser;
    if (process.env.NODE_ENV === "production") {
      const chromium = await import("chrome-aws-lambda");
      browser = await puppeteer.launch({
        executablePath: await chromium.default.executablePath,
        args: chromium.default.args,
        headless: chromium.default.headless,
      });
    } else {
      browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }

    const page = await browser.newPage();
    await page.setContent(html_content, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", landscape: true });
    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=report.pdf",
      },
    });
  } catch (error) {
    console.error("Error generating GA report:", error);
    return NextResponse.json(
      { error: "An error occurred while generating report" },
      { status: 500 },
    );
  }
}
