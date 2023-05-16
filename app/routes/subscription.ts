import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";
import { getApi } from "~/api";
import { getUserByEmail } from "~/models/user.server";

const schema = z.object({ email: z.string() });

export const action = async ({ request }: ActionArgs) => {
  if (request.method !== "POST") {
    return new Response("", { status: 405 });
  }
  const result = schema.safeParse(await request.json());

  if (result.success) {
    const user = await getUserByEmail(result.data.email);

    if (user) {
      const askell = getApi();
      const subscriptions = await askell.get(
        "/customers/:customerReference/subscriptions/",
        {
          params: { customerReference: user.kennitala },
        }
      );
      return json({
        subscription: !!subscriptions.find(({ active }) => active),
      });
    }
  }

  return json({ subscription: false });
};
