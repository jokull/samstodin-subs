import { askell } from "~/lib/api";

import { User } from "../schema";

export type Subscription = NonNullable<
  Awaited<ReturnType<typeof getSubscription>>
>;

export type Plan = Awaited<ReturnType<typeof getPlans>>[0];

export async function getSubscription(user: User) {
  const subscriptions = await askell.get(
    "/customers/:customerReference/subscriptions/",
    {
      params: { customerReference: user.kennitala },
    },
  );
  return subscriptions.find(({ active }) => active) ?? null;
}

export async function getPlans() {
  return await askell.get("/plans/");
}
