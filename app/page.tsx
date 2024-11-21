import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Header } from "~/components/Header";
import { getSession } from "~/lib/session";

import { Subscribe } from "./_components/subscribe";
import { unsubscribe } from "./actions";
import {
  getPlans,
  getSubscription,
  Subscription as SubscriptionType,
} from "./queries";

function Subscription({ subscription }: { subscription: SubscriptionType }) {
  return (
    <>
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-black">Áskrift</h1>
        <p>
          Með áskrift að Samstöðinni styrkir fólk þætti og fréttaskrif og
          tryggir einnig að hægt sé að hafa allt efni stöðvarinnar opið.
        </p>
        <p>
          Með áskriftinni getur fólk líka orðið félagar í Alþýðufélaginu, sem á
          og rekur Samstöðina. Samstöðin er eini fjölmiðillinn sem er í eigu
          hlustenda, áhorfenda og lesenda.
        </p>
      </div>
      <div className="mb-8 space-y-4">
        <p className="font-bold">Þú ert með áskrift að Samstöðinni.</p>
        {subscription.active_until ? (
          <p>
            {subscription.ended_at
              ? "Áskriftinni hefur verið hætt og rennur hún út"
              : "Áskriftin verður næst endurnýjuð sjálfkrafa"}{" "}
            {new Date(Date.parse(subscription.active_until)).toLocaleDateString(
              "is-IS",
              {
                dateStyle: "long",
              },
            )}
          </p>
        ) : null}
        <p className="mb-8">
          Til að breyta um upphæð þarf að segja upp áskrift fyrst og skrá þig
          svo aftur.
        </p>
        <div>
          <a
            className="underline"
            target="_blank"
            href={`https://askell.is/change_subscription/${
              subscription.token ?? ""
            }`}
            rel="noreferrer"
          >
            Uppfæra greiðslumáta
          </a>{" "}
          eða{" "}
          <button
            className="underline"
            onClick={(event) => {
              event.preventDefault();
              if (subscription.id) {
                void unsubscribe(subscription.id.toString());
              }
            }}
          >
            segja upp áskrift
          </button>
        </div>
      </div>
    </>
  );
}

export default async function Page() {
  const user = await getSession(cookies());

  if (!user) {
    redirect("/askrift");
  }

  const subscription = await getSubscription(user);

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
