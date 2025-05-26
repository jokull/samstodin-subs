"use client";

import { useTransition } from "react";

import { unsubscribe } from "../actions";
import { Subscription as SubscriptionType } from "../queries";

export function Subscription({
  subscription,
}: {
  subscription: SubscriptionType;
}) {
  const [isPending, startTransition] = useTransition();
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
            {subscription.active_until.toLocaleDateString("is-IS", {
              dateStyle: "long",
            })}
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
            className="underline disabled:opacity-50"
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              startTransition(() => {
                if (subscription.id) {
                  void unsubscribe(subscription.id.toString());
                }
              });
            }}
          >
            segja upp áskrift
          </button>
        </div>
      </div>
    </>
  );
}
