"use client";

import { useState } from "react";

import { PlanPicker } from "~/components/PlanPicker";

import { subscribe } from "../actions";
import { Plan } from "../queries";

export function Subscribe({ plans }: { plans: Plan[] }) {
  const [plan, setPlan] = useState(plans[1]!);
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
              className="font-white grow rounded-md border-[1.5px] border-black bg-black px-4 pb-1.5 pt-2 text-white shadow-black/5 hover:shadow-lg"
            >
              Áfram
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
