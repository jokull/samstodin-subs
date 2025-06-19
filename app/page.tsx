import { isErrorFromPath } from "@zodios/core";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Header } from "~/components/Header";
import { askell } from "~/lib/api";
import { db } from "~/lib/db";
import { getSealedEmail } from "~/lib/session";
import { normalizeEmail } from "~/lib/utils";
import { User } from "~/schema";

import { ProfileForm } from "./_components/profile-form";
import { Subscribe } from "./_components/subscribe";
import { Subscription } from "./_components/subscription";
import { getPlans, getSubscriptions } from "./queries";

export default async function Page() {
  const email = await getSealedEmail(
    (await cookies()).get("__session")?.value ?? "",
  );

  if (!email) {
    redirect("/login");
  }

  const user = email
    ? await db.query.User.findFirst({
        where: eq(User.email, normalizeEmail(email)),
      })
    : null;

  const subscriptions = user
    ? await getSubscriptions(user).catch((error) => {
        if (
          isErrorFromPath(
            askell.api,
            "get",
            "/customers/:customerReference/subscriptions/",
            error,
          )
        ) {
          return [];
        }
        console.error(error);
        return [];
      })
    : [];

  const activeSubscription = subscriptions.find(
    (subscription) =>
      subscription.active === true && subscription.cancelled === false,
  );

  const activeButCancelledSubscription = subscriptions.find(
    (subscription) =>
      subscription.active === true && subscription.cancelled === true,
  );

  return (
    <div className="mx-auto flex h-full min-h-screen max-w-2xl flex-col">
      <div className="px-4">
        <Header email={email} />
      </div>
      <main className="h-full bg-white p-4">
        {!user ? (
          <ProfileForm />
        ) : activeSubscription ? (
          <Subscription subscription={activeSubscription} />
        ) : (
          <Subscribe
            plans={await getPlans()}
            activeButCancelledSubscription={activeButCancelledSubscription}
          />
        )}
      </main>
    </div>
  );
}
