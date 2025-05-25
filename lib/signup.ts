import { sealData, unsealData } from "iron-session";
import { z } from "zod";

export const signupSchema = z.string();

export async function getSignup(token: string) {
  const unsealed = await unsealData(token, {
    password: process.env.SESSION_SECRET ?? "",
    ttl: 120 * 60,
  });
  return signupSchema.safeParse(unsealed);
}

export async function getToken(props: z.infer<typeof signupSchema>) {
  return await sealData(props, {
    password: process.env.SESSION_SECRET ?? "",
    ttl: 15 * 60,
  });
}
