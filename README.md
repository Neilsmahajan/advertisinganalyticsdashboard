# Advertising Analytics Dashboard

**ASU Honors Thesis Project by Neil S. Mahajan**  
Barrett, The Honors College, Arizona State University  
Thesis Director: Dr. Maria Elena Chavez Echeagaray  
Second Reader: Christine Dansereau  
May 2025

---

## Abstract

The Advertising Analytics Dashboard is a unified web platform designed to resolve the fragmentation of digital advertising analytics across major platforms such as Google, Meta, and Microsoft. Developed as an Honors Thesis project for Vloe, a Quebec-based advertising agency, the dashboard enables businesses and agencies to retrieve, analyze, and report on advertising and tracking data from multiple accounts and platforms in a single, user-friendly interface. Key features include detection of embedded tracking tags, OAuth-based account connections, query saving, PDF report generation, and dynamic localization in English and Canadian French. Usability testing with 14 participants demonstrated the dashboard’s intuitiveness, accuracy, and value for marketing professionals.

---

## Table of Contents

- [Introduction](#introduction)
- [Background and Related Work](#background-and-related-work)
- [Approach](#approach)
- [System Design and Architecture](#system-design-and-architecture)
- [Technologies Used](#technologies-used)
- [Key Components](#key-components)
- [Development Process](#development-process)
- [Features and Functionalities](#features-and-functionalities)
- [Research Methodology](#research-methodology)
- [Results](#results)
- [Discussion](#discussion)
- [Conclusion](#conclusion)
- [Future Work](#future-work)
- [Deployment](#deployment)
- [Contact](#contact)

---

## Introduction

Digital advertising now accounts for over 70% of global ad investments, making the ability to analyze and optimize campaigns across platforms essential for business growth. However, marketers and agencies face significant challenges due to the fragmentation of analytics data, requiring them to log into multiple dashboards with inconsistent data schemes and reporting styles. The Advertising Analytics Dashboard was developed to address these inefficiencies by providing a centralized, bilingual, and extensible platform for retrieving and analyzing advertising and tracking data across Google Analytics, Google Ads, Meta Ads, and Microsoft Ads.

---

## Background and Related Work

Existing tools such as BuiltWith.com, Google Looker Studio, Meta Ads Library, and Google Ads Transparency Center each address parts of the analytics fragmentation problem but fall short as all-in-one solutions:

- **BuiltWith.com**: Detects website tracking tags but does not show live ads.
- **Google Looker Studio**: Offers data visualization but has a steep learning curve and limited multi-platform integration.
- **Meta Ads Library & Google Transparency Center**: Show public-facing ads but lack campaign-specific data.

The Advertising Analytics Dashboard was designed to overcome these limitations by integrating tracking tag detection, live ad visibility, and direct API-based campaign analytics in a single, cohesive interface.

---

## Approach

The project followed a full-stack, modular approach with the following goals:

- **Website-level tracking analysis**: Detect embedded analytics and advertising tags from any URL.
- **Centralized advertising data**: Aggregate campaign metrics from Google Analytics, Google Ads, Meta Ads, and Microsoft Ads.
- **Secure OAuth login**: Support Google, Meta, and Microsoft OAuth for seamless account connections.
- **Query management**: Allow users to save, view, and rerun analysis queries.
- **PDF report generation**: Enable export of results as localized, formatted PDF reports.
- **Bilingual localization**: Support English and Canadian French.
- **Production deployment**: Host the application at [advertisinganalyticsdashboard.com](https://advertisinganalyticsdashboard.com).

---

## System Design and Architecture

The dashboard is built for scalability, responsiveness, and usability:

- **Frontend**: Next.js 15 (React, TypeScript, App Router), with dynamic localization and responsive UI.
- **Backend**: Node.js API routes (TypeScript) for secure data retrieval and processing.
- **Database**: Neon PostgreSQL with Prisma ORM for user, query, and session management.
- **Authentication**: Auth.js with Google, Meta, and Microsoft OAuth providers.
- **Deployment**: Vercel hosting with Cloudflare-managed domain.
- **Localization**: next-intl for English/French support.

**Architecture Diagram**  
_See Figure 2 in the thesis for a visual overview of data flow between frontend, backend, third-party APIs, and the database._

---

## Technologies Used

- **Frontend**: Next.js 15, React, TypeScript
- **Backend**: Node.js, TypeScript API routes
- **Database**: PostgreSQL (Neon), Prisma ORM
- **Authentication**: Auth.js (Google, Meta, Microsoft OAuth)
- **Deployment**: Vercel, Cloudflare
- **Localization**: next-intl
- **PDF Generation**: Puppeteer/Browserless
- **Other**: Tailwind CSS, Chart.js (for future visualizations)

---

## Key Components

- **Tracking Data Service**: Web scraping and regex/DOM parsing to detect analytics and ad tags (e.g., Google Tag Manager, Meta Pixel).
- **Google Analytics Service**: Fetches sessions, page views, and demographics via the Google Analytics Data API.
- **Google Ads Service**: Retrieves campaign metrics (impressions, clicks, cost, conversions) via GAQL and OAuth.
- **Meta Ads Service**: Pulls campaign-level metrics from Facebook and Instagram using the Meta Graph API.
- **Microsoft Ads Service**: Fetches campaign statistics via the Microsoft Advertising REST API.
- **Query Management**: Save, rerun, and manage analysis queries for all services.
- **PDF Report Generation**: Downloadable, localized PDF reports for any query.
- **Localization**: Full support for English and Canadian French, including UI and PDF exports.

---

## Development Process

The project followed an agile, iterative approach:

### Iteration 1: Proof of Concept

- Flask backend + React frontend
- Hard-coded API keys for initial data retrieval
- Validated feasibility and motivated move to OAuth and unified stack

### Iteration 2: Firebase-Powered MVP

- Migrated to Next.js and Firebase for authentication and storage
- Added OAuth flows and improved UI/UX

### Iteration 3: Final System

- Adopted PostgreSQL (Neon) and Prisma ORM for robust data management
- Implemented modular API routes, localization, and production deployment

---

## Features and Functionalities

### Tracking Data Service

- Enter any website URL to detect embedded analytics and ad tags
- View detected tags (e.g., Google Analytics, Meta Pixel) in a tabular format
- See links to live ads via Google Ads Transparency Center and Meta Ads Library

### Google Analytics Service

- Connect Google account via OAuth
- Enter property ID and date range to retrieve sessions, page views, and demographics

### Google Ads Service

- Connect Google account via OAuth
- Enter customer ID and date range to retrieve campaign metrics (impressions, clicks, cost, conversions)

### Meta Ads Service

- Connect Meta account via OAuth
- Enter ad account ID and date range to retrieve campaign-level metrics from Facebook and Instagram

### Microsoft Ads Service

- Connect Microsoft account via OAuth
- Enter customer ID and date range to retrieve campaign statistics (clicks, impressions, cost per click, conversions)

### Localization and Accessibility

- Automatic browser language detection (English/Canadian French)
- Manual language toggle
- Fully localized UI and PDF reports
- WCAG-compliant design for accessibility

### Saved Queries and Report Generation

- Save any query for future use
- Rerun saved queries with one click
- Download results as localized PDF reports

---

## Research Methodology

A usability study was conducted with 14 participants (business owners and agency professionals) who interacted with the live dashboard and completed a structured survey. The study was IRB-approved by ASU and included:

- Task-based protocol: Logging in, using each service, and exporting reports
- Survey: Usability, intuitiveness, accuracy, and design feedback
- Optional follow-up interview (none requested)

**Participant Demographics:**

- Age: 18–54 (majority 25–34)
- Expertise: Beginner (14%), Intermediate (57%), Advanced (29%)
- Platform familiarity: Google Analytics (86%), Google Ads (71%), Meta Ads (64%), Microsoft Ads (50%)

---

## Results

- **Usability**: Overall Ease of Use (4.4/5), System Intuitiveness (4.2/5), Interface Design (4.5/5)
- **Service Ratings**: Tracking Data (4.6), Google Analytics (4.4), Meta Ads (4.3), Google Ads (4.2), Microsoft Ads (4.0)
- **Pain Points**: Difficulty locating Customer IDs (14%), OAuth permission errors (14%), request for more onboarding/tooltips (14%)
- **Enhancement Requests**: Cross-platform summary view (79%), built-in visualizations (71%), granular filtering (64%)
- **Recommendation**: 100% would recommend to colleagues

---

## Discussion

The dashboard was rated highly for usability, design, and the usefulness of its core modules. The Tracking Data service was especially valued for its accuracy and accessibility. Minor pain points included locating customer IDs and occasional OAuth errors. The most requested improvements were cross-platform summaries, visualizations, and more granular filtering.

---

## Conclusion

The Advertising Analytics Dashboard successfully addresses the challenge of fragmented advertising analytics by providing a centralized, intuitive, and bilingual platform for campaign analysis and optimization. The tool streamlines reporting for agencies and businesses, enabling faster, data-driven decision-making. Usability testing confirmed its value and highlighted areas for future enhancement.

---

## Future Work

Planned improvements and extensions include:

- Support for additional platforms (TikTok Ads, Snapchat Ads, LinkedIn Ads)
- Billing and subscription integration (e.g., Stripe)
- Organization-wide dashboards and role-based permissions
- Cross-platform summary and comparison views
- Built-in visualizations (e.g., time-series charts)
- Streamlined OAuth flows and improved onboarding/tooltips

---

## Deployment

The dashboard is deployed at:  
[https://advertisinganalyticsdashboard.com](https://advertisinganalyticsdashboard.com)

---

## Contact

For questions, support, or collaboration, contact:  
Neil S. Mahajan  
[contact@advertisinganalyticsdashboard.com](mailto:contact@advertisinganalyticsdashboard.com)

---

## References

- Advertising Analytics Dashboard. (n.d.). Advertising Analytics Dashboard. https://advertisinganalyticsdashboard.com
- Auth.js. (n.d.). Auth.js. https://authjs.dev
- BuiltWith. (n.d.). BuiltWith. https://builtwith.com
- Cloudflare. (n.d.). Cloudflare. https://www.cloudflare.com
- Google. (n.d.). Ads Transparency Center. https://adstransparency.google.com/
- Google. (n.d.). Analytics. https://marketingplatform.google.com/about/analytics/
- Google. (n.d.). Google Ads. https://business.google.com/us/google-ads/
- Google. (n.d.). Looker Studio. https://lookerstudio.google.com
- Meta. (n.d.). Ad Library. https://www.facebook.com/ads/library
- Meta. (n.d.). Meta for Business. https://business.meta.com/?locale=en_US
- Microsoft. (n.d.). Microsoft Advertising. https://ads.microsoft.com
- Microsoft. (n.d.). TypeScript. https://www.typescriptlang.org
- Neon. (n.d.). Neon. https://neon.tech
- next-intl. (n.d.). next-intl. https://next-intl.dev
- OpenJS Foundation. (n.d.). Node.js. https://nodejs.org
- The PostgreSQL Global Development Group. (n.d.). PostgreSQL. https://www.postgresql.org
- Prisma Data. (n.d.). Prisma. https://www.prisma.io
- Schildge, G. (2024, February 1). Demystifying Google Looker Studio for Marketing Ops. Matrix Marketing Group. https://matrixmarketinggroup.com/google-looker-studio-marketing-operations/
- Statista. (2025, April 29). Topic: Digital Advertising Worldwide. https://www.statista.com/topics/7666/internet-advertising-worldwide/#topicOverview 
- Vercel. (n.d.). Next.js. https://nextjs.org
- Vercel. (n.d.). Vercel. https://vercel.com
- Vloe. (n.d.). Vloe. https://www.vloe.ca

---
