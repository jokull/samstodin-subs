"use client";

import { Label, Radio, RadioGroup } from "react-aria-components";

import { formatCurrencyIcelandic } from "~/lib/utils";

import { Plan } from "../app/queries";

export function PlanPicker({
  plan,
  setPlan,
  plans,
}: {
  plans: Plan[];
  plan: Plan | null;
  setPlan: (value: Plan) => void;
}) {
  return (
    <RadioGroup
      value={plan?.id?.toString() ?? null}
      className="grid grid-cols-3 gap-2 sm:gap-4"
      onChange={(value) => {
        const plan = plans.find(({ id }) => id?.toString() === value);
        if (plan) {
          setPlan(plan);
        }
      }}
    >
      {plans.map(({ amount, id }) => (
        <Radio
          key={id}
          value={id!.toString()}
          className="cursor-pointer rounded-md border-[1.5px] border-black bg-white px-4 pt-2 pb-1.5 font-black shadow-black/5 transition-transform hover:-translate-y-0.5 hover:scale-105 data-[selected]:bg-black data-[selected]:text-white"
        >
          <Label>{formatCurrencyIcelandic(amount!)}</Label>
        </Radio>
      ))}
    </RadioGroup>
  );
}
