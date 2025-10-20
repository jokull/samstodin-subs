"use client";

import { Subscription } from "~/lib/api";

import { subscribe } from "../actions";

export function Subscribe({
  activeButCancelledSubscription,
}: {
  activeButCancelledSubscription?: Subscription;
}) {
  return (
    <div>
      <form
        action={() => {
          // This calls the server action we just modified in app/actions.ts
          void subscribe();
        }}
      >
        <p className="mb-2">
          Þú getur lagt þín lóð á vogarskálarnar í hverjum mánuði. Í næsta skrefi velur þú á milli þriggja þyngdarflokka:
        </p>
        <p className="mb-8 font-bold text-center">
          2.750 kr. — 5.500 kr. — 11.000 kr.
        </p>
        <div className="mt-8">
          <button
            type="submit"
            className="w-full cursor-pointer rounded-md border-[1.5px] border-black bg-black px-4 pt-2 pb-1.5 font-white text-white shadow-black/5 hover:opacity-90 hover:shadow-lg"
          >
            Áfram
          </button>
        </div>
      </form>

      {activeButCancelledSubscription?.active_until ? (
        <div>
          <p className="mt-8">
            Þú ert með áskrift sem hefur verið stöðvuð og rennur út{" "}
            {activeButCancelledSubscription.active_until.toLocaleDateString(
              "is-IS",
              {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              },
            )}
          </p>
        </div>
      ) : null}
    </div>
  );
}
