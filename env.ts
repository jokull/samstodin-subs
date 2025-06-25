import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    SESSION_SECRET: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    DATABASE_AUTH_TOKEN: z.string().min(1),
    ASKELL_PUBLIC: z.string().min(1),
    ASKELL_PRIVATE: z.string().min(1),
    ASKELL_WEBHOOKS_HMAC_SECRET: z.string().min(1),
    SAMSTODIN_EMAIL_ADDRESS: z.string().email(),
    SAMSTODIN_EMAIL_PASSWORD: z.string().min(1),
    GOOGLE_AUTH_CLIENT_SECRET: z.string().min(1),
    UPLOADTHING_TOKEN: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL: z.string().min(1),
    NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID: z.string().min(1),
  },
  runtimeEnv: {
    NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL:
      process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,
    ASKELL_PUBLIC: process.env.ASKELL_PUBLIC,
    ASKELL_PRIVATE: process.env.ASKELL_PRIVATE,
    ASKELL_WEBHOOKS_HMAC_SECRET: process.env.ASKELL_WEBHOOKS_HMAC_SECRET,
    SAMSTODIN_EMAIL_ADDRESS: process.env.SAMSTODIN_EMAIL_ADDRESS,
    SAMSTODIN_EMAIL_PASSWORD: process.env.SAMSTODIN_EMAIL_PASSWORD,
    NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID:
      process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID,
    GOOGLE_AUTH_CLIENT_SECRET: process.env.GOOGLE_AUTH_CLIENT_SECRET,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
  },
});
