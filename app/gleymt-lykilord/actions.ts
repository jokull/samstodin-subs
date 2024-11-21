"use server";

import { z } from "zod";

import { getUserByEmail } from "~/lib/queries/users";
import { sendEmail } from "~/lib/samstodin";
import { getSealedSession } from "~/lib/session";
import { normalizeEmail } from "~/lib/utils";

export async function requestPassword(email: string) {
  const result = z
    .string()
    .email()
    .refine((value) => normalizeEmail(value))
    .safeParse(email);
  if (!result.success) {
    return { error: "Netfang virðist vera vitlaust skrifað" };
  }
  const normalizedEmail = result.data;
  const user = await getUserByEmail(normalizedEmail);
  if (!user) {
    return { error: "Enginn notandi fannst með þetta netfang" };
  }
  const token = await getSealedSession(normalizedEmail);
  const tokenUrl = `https://${process.env.EXTERNAL_HOST}/nytt-lykilord?token=${token}`;
  await sendEmail(
    normalizedEmail,
    "Endurstilla lykilorð",
    tokenUrl,
    `<a href="${tokenUrl}">Endurstilla</a>`,
  );
  return null;
}
