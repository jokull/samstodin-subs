import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Header } from "~/components/Header";
import { db } from "~/lib/db";
import { getSealedEmail } from "~/lib/session";
import { normalizeEmail } from "~/lib/utils";
import { User } from "~/schema";

import { ProfileForm } from "./_components/profile-form";
import { Subscribe } from "./_components/subscribe";
import { Subscription } from "./_components/subscription";
import { getSubscriptions } from "./queries";

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
    ? await getSubscriptions(user).catch((error: unknown) => {
        console.error("[page] Failed to load Askell subscriptions", error);
        return [];
      })
    : [];

  const activeSubscription = subscriptions.find(
    (subscription) => subscription.isActive && !subscription.isCancelled,
  );

  const pausedSubscription = subscriptions.find(
    (subscription) => subscription.state === "paused",
  );

  const activeButCancelledSubscription = subscriptions.find(
    (subscription) => subscription.isActive && subscription.isCancelled,
  );

  const currentSubscription = activeSubscription ?? pausedSubscription;

  return (
    <div className="mx-auto flex h-full min-h-screen max-w-2xl flex-col">
      <div className="px-4">
        <Header email={email} />
      </div>
      <main className="h-full bg-white p-4">
        {!user ? (
          <ProfileForm />
        ) : currentSubscription ? (
          <Subscription subscription={currentSubscription} />
        ) : (
          <Subscribe
            activeButCancelledSubscription={activeButCancelledSubscription}
          />
        )}
      </main>
    </div>
  );
}
