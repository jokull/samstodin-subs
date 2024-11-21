"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createUser } from "~/lib/queries/users";
import { getSealedSession, getSessionCookieSettings } from "~/lib/session";
import { getSignup } from "~/lib/signup";
import { normalizeEmail } from "~/lib/utils";

export async function signup(password: string, token: string) {
  const result = await getSignup(token);
  if (!result.success) {
    return null;
  }

  if (password.length < 4) {
    return { error: "Lykilorð er of stutt" };
  }

  const user = await createUser({
    email: normalizeEmail(result.data.email),
    password: password,
    kennitala: result.data.kennitala,
    althydufelagid: result.data.althydufelagid,
    name: result.data.name,
  });

  cookies().set({
    value: await getSealedSession(user.email),
    ...getSessionCookieSettings(),
  });

  const externalDomain = process.env.EXTERNAL_HOST ?? "localhost";
  const redirectUri = `https://${externalDomain}/`;
  redirect(
    `https://askell.is/subscribe-button/${result.data.planId}/?reference=${
      user.kennitala
    }&redirect=${encodeURIComponent(redirectUri)}`,
  );
}
