import { isErrorFromPath } from "@zodios/core";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Header } from "~/components/Header";
import { askell } from "~/lib/api";
import { getSession } from "~/lib/session";

import { Subscribe } from "./_components/subscribe";
import { Subscription } from "./_components/subscription";
import {
  getPlans,
  getSubscription
} from "./queries";

export default async function Page() {
  const user = await getSession(cookies().get("__session")?.value ?? "");

  if (!user) {
    redirect("/askrift");
  }

  const subscription = await getSubscription(user).catch((error) => {
    if (
      isErrorFromPath(
        askell.api,
        "get",
        "/customers/:customerReference/subscriptions/",
        error,
      )
    ) {
      return undefined;
    }
    console.log(error);
    return undefined;
  });

  return (
    <div className="mx-auto flex h-full min-h-screen max-w-2xl flex-col">
      <div className="px-4">
        <Header user={user} />
      </div>
      <main className="h-full bg-white p-4">
        {subscription ? (
          <Subscription subscription={subscription} />
        ) : (
          <Subscribe plans={await getPlans()} />
        )}
      </main>
    </div>
  );
}
