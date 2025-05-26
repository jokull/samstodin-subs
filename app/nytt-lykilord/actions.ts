"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { updateUserPassword } from "~/lib/queries/users";
import {
  getSealedSession,
  getSession,
  getSessionCookieSettings,
} from "~/lib/session";

export async function setPassword(password: string, token: string) {
  const user = await getSession(token);
  if (!user) {
    return null;
  }

  if (password.length < 4) {
    return { error: "Lykilorð er of stutt" };
  }

  await updateUserPassword(user, password);

  (await cookies()).set({
    value: await getSealedSession(user.email),
    ...getSessionCookieSettings(),
  });

  redirect("/");
}
