import { Redis } from "@upstash/redis";

// The Vercel Upstash integration sets KV_REST_API_*; UPSTASH_REDIS_REST_* is
// the name Upstash uses when the database is connected directly.
const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

const client = url && token ? new Redis({ url, token }) : null;

// The cache is optional: a failed call is logged and treated as a miss, so a
// Redis outage never fails the request.
export const redis = client
  ? {
      async get<T = unknown>(key: string): Promise<T | null> {
        try {
          return await client.get<T>(key);
        } catch (error) {
          console.error("Redis get failed:", error);
          return null;
        }
      },
      async set(key: string, value: unknown, options: { ex: number }) {
        try {
          await client.set(key, value, options);
        } catch (error) {
          console.error("Redis set failed:", error);
        }
      },
      async del(key: string) {
        try {
          await client.del(key);
        } catch (error) {
          console.error("Redis del failed:", error);
        }
      },
    }
  : null;
