declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production";
    BROWSERLESS_API_KEY?: string;
    BROWSERLESS_API_URL?: string;
    // other environment variables
  }
}
