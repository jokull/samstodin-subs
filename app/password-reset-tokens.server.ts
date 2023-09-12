import { sealData, unsealData } from "iron-session";
import { z } from "zod";
import { normalizeEmail } from "~/utils";

const schema = z.object({ email: z.string() });

export async function getPasswordResetTokenData(token: string) {
  const unsealed = await unsealData(token, {
    password: process.env.SESSION_SECRET ?? "",
  });
  return schema.safeParse(unsealed);
}

export async function getPasswordResetToken({ email }: z.infer<typeof schema>) {
  return await sealData(
    {
      email: normalizeEmail(email),
    },
    { password: process.env.SESSION_SECRET ?? "", ttl: 15 * 60 }
  );
}
