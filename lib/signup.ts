import { sealData, unsealData } from "iron-session";
import { z } from "zod";

import { normalizeEmail } from "~/lib/utils";

export const signupSchema = z.object({
  email: z.string(),
  kennitala: z.string(),
  althydufelagid: z.boolean(),
  name: z.string(),
  planId: z.string(),
});

export async function getSignup(token: string) {
  const unsealed = await unsealData(token, {
    password: process.env.SESSION_SECRET ?? "",
    ttl: 120 * 60,
  });
  return signupSchema.safeParse(unsealed);
}

export async function getToken({
  email,
  ...props
}: z.infer<typeof signupSchema>) {
  return await sealData(
    {
      email: normalizeEmail(email),
      ...props,
    },
    { password: process.env.SESSION_SECRET ?? "", ttl: 15 * 60 },
  );
}
