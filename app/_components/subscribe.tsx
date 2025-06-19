"use client";

import { useState } from "react";

import { PlanPicker } from "~/components/PlanPicker";
import { Subscription } from "~/lib/api";

import { subscribe } from "../actions";
import { Plan } from "../queries";

export function Subscribe({
  plans,
  activeButCancelledSubscription,
}: {
  plans: Plan[];
  activeButCancelledSubscription?: Subscription;
}) {
  const [plan, setPlan] = useState(plans[1] ?? null);
  return (
    <div>
      {plans.length === 0 ? (
        <p className="p-4">Engar áskriftir í boði</p>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (plan?.id) {
              void subscribe(plan.id.toString());
            }
          }}
        >
          <p>
            Þú getur lagt þín lóð á vogarskálarnar í hverjum mánuði í þremur
            þyngdarflokkum.
          </p>
          <div className="mt-8 flex gap-2 sm:gap-4">
            <PlanPicker plan={plan} plans={plans} setPlan={setPlan} />
            <button
              type="submit"
              className="font-white grow cursor-pointer rounded-md border-[1.5px] border-black bg-black px-4 pt-2 pb-1.5 text-white shadow-black/5 hover:opacity-90 hover:shadow-lg"
            >
              Áfram
            </button>
          </div>
        </form>
      )}

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
