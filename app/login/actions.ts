"use server";

import { cookies } from "next/headers";
import { z } from "zod";

import {
  getSealedSession,
  getSessionCookieSettings,
  verifyLogin,
} from "~/lib/session";
import { normalizeEmail } from "~/lib/utils";

const schema = z.object({
  email: z.string(),
  password: z.string(),
});

export async function login(prevState: unknown, formData: FormData) {
  const result = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!result.success) {
    return { error: "Fann ekki notanda, eða lykilorð er ekki rétt" };
  }
  const user = await verifyLogin(
    normalizeEmail(result.data.email),
    result.data.password,
  );
  if (!user) {
    return { error: "Fann ekki notanda, eða lykilorð er ekki rétt" };
  }
  (await cookies()).set({
    value: await getSealedSession(user.email),
    ...getSessionCookieSettings(),
  });
  return null;
}
