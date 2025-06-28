import { decodeBase64url } from "@oslojs/encoding";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { env } from "~/env";
import { db } from "~/lib/db";
import { getSealedSession, getSessionCookieSettings } from "~/lib/session";
import { Email } from "~/schema";

import { verifyGoogleCode } from "../google-auth";
import { safeJsonParse, safeZodParse } from "../safe";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const encodedState = searchParams.get("state") ?? "";

  if (!code) {
    return NextResponse.redirect(`/?error=missing_code`);
  }

  let redirectUrl: string | null = null;

  if (!encodedState) {
    // If no state is provided, we generate a new signup object with a unique ID
    throw new Error("Missing state parameter");
  }

  const decodedData = decodeBase64url(encodedState);
  const decodedString = new TextDecoder().decode(decodedData);

  const jsonResult = safeJsonParse(decodedString);

  const redirectResult = jsonResult.andThen((obj) =>
    safeZodParse(z.object({ redirect: z.string() }))(obj),
  );
  if (redirectResult.isOk()) {
    redirectUrl = redirectResult.value.redirect;
  } else {
    redirectUrl = null;
  }

  const result = await verifyGoogleCode(code, env.GOOGLE_AUTH_CLIENT_SECRET);

  if (result.isErr()) {
    if (result.error.type === "auth") {
      const errorUrl = new URL(
        "/auth/error",
        `https://${env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`,
      );
      errorUrl.searchParams.set("error", result.error.message);
      return NextResponse.redirect(errorUrl);
    } else {
      if (result.error.type === "zod") {
        throw result.error.error;
      } else {
        throw new Error(result.error.type);
      }
    }
  }

  const payload = result.value;

  (await cookies()).set({
    value: await getSealedSession(payload.email),
    ...getSessionCookieSettings(),
  });

  await db
    .insert(Email)
    .values({
      email: payload.email,
      source: "google",
    })
    .onConflictDoNothing();

  return NextResponse.redirect(
    new URL(
      redirectUrl ?? "/",
      `https://${env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`,
    ),
  );
}
