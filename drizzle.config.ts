import "dotenv/config";

import type { Config } from "drizzle-kit";

export default {
  out: "./drizzle",
  schema: "./schema.ts",
  strict: true,
  verbose: true,
  driver: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
} satisfies Config;
