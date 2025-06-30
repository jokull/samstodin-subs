"use client";

import { formatCurrencyIcelandic } from "~/lib/utils";

import { Plan } from "../../queries";

export function PlanPreview({ plans }: { plans: Plan[] }) {
  if (plans.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 rounded-md bg-neutral-200 px-2 py-8">
      <p className="mb-6 text-center text-balance text-gray-700">
        Þú getur lagt þín lóð á vogarskálarnar í hverjum mánuði í þremur
        þyngdarflokkum.
      </p>
      <div className="flex items-stretch justify-center divide-x-1 divide-neutral-400">
        {plans.map(({ amount, id }) => (
          <div key={id} className="px-8 py-2 text-center font-black text-black">
            {formatCurrencyIcelandic(amount!)}
          </div>
        ))}
      </div>
    </div>
  );
}
