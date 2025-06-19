import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";

import { env } from "~/env";

import { default as schema } from "../schema";

export function getDrizzle() {
  return drizzle(
    createClient({
      authToken: env.DATABASE_AUTH_TOKEN,
      url: env.DATABASE_URL,
    }),
    { schema },
  );
}

export const db = getDrizzle();

export type Database = ReturnType<typeof getDrizzle>;
