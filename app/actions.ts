"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { env } from "~/env";
import { askell } from "~/lib/api";
import { getSession } from "~/lib/session";

export async function subscribe(planId: string) {
  const user = await getSession(
    (await cookies()).get("__session")?.value ?? "",
  );
  const redirectUri = `https://${env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}/`;
  if (user) {
    redirect(
      `https://askell.is/subscribe-button/${planId}/?reference=${
        user.kennitala
      }&redirect=${encodeURIComponent(redirectUri)}`,
    );
  }
  redirect("/");
}

export async function unsubscribe(subscriptionId: string) {
  const user = await getSession(
    (await cookies()).get("__session")?.value ?? "",
  );
  if (!user) {
    return;
  }
  await askell.post("/subscriptions/:subscriptionId/cancel/", {} as never, {
    params: { subscriptionId },
  });
  // Sleep 3 seconds
  await new Promise((resolve) => setTimeout(resolve, 3000));
  revalidatePath("/");
}
