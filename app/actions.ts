"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { askell } from "~/lib/api";
import { cancelSubscriptionContract } from "~/lib/askell-v2";
import { getSession } from "~/lib/session";

import { getSubscriptions } from "./queries";

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

export async function unsubscribe(
  subscriptionId: number,
  source: "contract" | "legacy",
) {
  const user = await getSession(
    (await cookies()).get("__session")?.value ?? "",
  );
  if (!user) {
    return;
  }
  // Only allow cancelling a subscription that belongs to the signed-in user.
  const owned = (await getSubscriptions(user)).some(
    (subscription) =>
      subscription.id === subscriptionId && subscription.source === source,
  );
  if (!owned) {
    console.warn("[unsubscribe] Subscription does not belong to user", {
      subscriptionId,
      source,
    });
    return;
  }
  if (source === "contract") {
    await cancelSubscriptionContract(subscriptionId);
  } else {
    await askell.post("/subscriptions/:subscriptionId/cancel/", {} as never, {
      params: { subscriptionId: subscriptionId.toString() },
    });
  }
  // Give Áskell a moment to settle the cancellation before re-reading.
  await new Promise((resolve) => setTimeout(resolve, 3000));
  revalidatePath("/");
}
