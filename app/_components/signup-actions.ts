"use server";

import { redirect } from "next/navigation";

import { env } from "~/env";

import { getGoogleAuthUrl } from "../google-auth";

// eslint-disable-next-line @typescript-eslint/require-await
export async function startGoogleAuthFlow(redirectTo?: string) {
  redirect(
    getGoogleAuthUrl({
      redirect: `https://${env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}${redirectTo ?? ""}`,
    }),
  );
}
