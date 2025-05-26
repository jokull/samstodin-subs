import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { db } from "~/lib/db";
import { getSealedSession, getSessionCookieSettings } from "~/lib/session";
import { getSignup } from "~/lib/signup";
import { Email } from "~/schema";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  try {
    const result = await getSignup(token);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const email = result.data;

    if (!email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    await db.insert(Email).values({ email }).onConflictDoNothing();

    cookies().set({
      value: await getSealedSession(email),
      ...getSessionCookieSettings(),
    });

    return NextResponse.redirect("/");
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process token" },
      { status: 500 },
    );
  }
}
