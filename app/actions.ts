"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { askell } from "~/lib/api";
import { getSession } from "~/lib/session";

export async function subscribe(planId: string) {
  const user = await getSession(cookies());
  const externalDomain = process.env.EXTERNAL_HOST ?? "localhost";
  const redirectUri = `https://${externalDomain}/`;
  if (user) {
    redirect(
      `https://askell.is/subscribe-button/${planId}/?reference=${
        user.kennitala
      }&redirect=${encodeURIComponent(redirectUri)}`,
    );
  }
  redirect("/askrift");
}

export async function unsubscribe(subscriptionId: string) {
  const user = await getSession(cookies());
  if (!user) {
    return;
  }
  await askell.post("/subscriptions/:subscriptionId/cancel/", {} as never, {
    params: { subscriptionId },
  });
  revalidatePath("/");
}
