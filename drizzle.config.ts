import { defineConfig } from "drizzle-kit";

import { env } from "~/env";

export default defineConfig({
  out: "./drizzle",
  schema: "./schema.ts",
  dialect: "turso",
  dbCredentials: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
  },
});
