import { sealData, unsealData } from "iron-session";
import { z } from "zod";
import { normalizeEmail } from "~/utils";

const schema = z.object({
  email: z.string(),
  kennitala: z.string(),
  althydufelagid: z.boolean(),
  name: z.string(),
  subscriptionId: z.string(),
});

export async function getTokenData(token: string) {
  const unsealed = await unsealData(token, {
    password: process.env.SESSION_SECRET ?? "",
  });
  return schema.safeParse(unsealed);
}

export async function getToken({ email, ...props }: z.infer<typeof schema>) {
  return await sealData(
    {
      email: normalizeEmail(email),
      ...props,
    },
    { password: process.env.SESSION_SECRET ?? "", ttl: 15 * 60 }
  );
}
