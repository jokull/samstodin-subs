"use server";

import { redirect } from "next/navigation";

import { getGoogleAuthUrl } from "../google-auth";

// eslint-disable-next-line @typescript-eslint/require-await
export async function startGoogleAuthFlow(redirectTo?: string) {
  redirect(
    getGoogleAuthUrl({
      redirect: `https://${process.env.NEXT_PUBLIC_VERCEL_URL!}${redirectTo ?? ""}`,
    }),
  );
}
