"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { askell } from "~/lib/api";
import { getSession } from "~/lib/session";

export async function subscribe() {
  console.log("[subscribe] Action initiated.");
  const user = await getSession(
    (await cookies()).get("__session")?.value ?? "",
  );

  if (user) {
    const redirectUrl = `https://askell.is/public/payments/118/?reference=${user.kennitala}`;
    // console.log(`[subscribe] User found: ${user.email}. Redirecting to: ${redirectUrl}`);
    // Redirect to the dedicated Áskell payment page.
    // The user will select their plan on this page.
    redirect(redirectUrl);
  }

  console.warn("[subscribe] No user session found. Redirecting to login.");
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
