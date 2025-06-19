"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "~/lib/db";
import { getSealedSession, getSessionCookieSettings } from "~/lib/session";
import { Email } from "~/schema";

export async function signupAction(formData: FormData) {
  const email = (formData.get("email") as string | null) ?? "";

  // Log the registration attempt for Gunnar's list
  await db
    .insert(Email)
    .values({
      email: email.toLowerCase().trim(),
      source: "password",
    })
    .onConflictDoNothing();
  console.log(`[signupAction] Logged signup attempt for: ${email}`);

  // Create a session with the user's email
  (await cookies()).set({
    value: await getSealedSession(email.toLowerCase().trim()),
    ...getSessionCookieSettings(),
  });
  console.log(
    `[signupAction] Session created for ${email}, redirecting to profile creation.`,
  );

  // Redirect to the homepage. The logic there will now detect
  // the session and show the user the profile creation form.
  redirect("/");
}