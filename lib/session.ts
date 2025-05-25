import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { sealData, unsealData } from "iron-session";
import { z } from "zod";

import { Password, User } from "../schema";
import { db } from "./db";

const sessionSchema = z.object({ email: z.string().email() });

export async function getSealedSession(email: string) {
  return await sealData({ email } satisfies z.infer<typeof sessionSchema>, {
    password: process.env.SESSION_SECRET!,
  });
}

export async function unsealVerificationToken(token: string) {
  const unsealed = await unsealData(token, {
    password: process.env.SESSION_SECRET!,
    ttl: 60 * 60,
  });
  return sessionSchema.parse({ email: unsealed }).email;
}

export async function getSession(token: string) {
  const data = await unsealData(token, {
    password: process.env.SESSION_SECRET ?? "",
  });
  const result = sessionSchema.safeParse(data);
  if (!result.success) {
    return undefined;
  }
  const user = await db.query.User.findFirst({
    where: eq(User.email, result.data.email),
  });
  return user;
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"],
) {
  const userWithPassword = await db.query.User.findFirst({
    where: eq(User.email, email),
    with: {
      password: true,
    },
  });

  if (!userWithPassword?.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash,
  );

  if (!isValid) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}

export function getSessionCookieSettings() {
  return {
    name: "__session",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    expires: new Date(new Date().valueOf() + 1000 * 60 * 60 * 24 * 365),
  } as const;
}
