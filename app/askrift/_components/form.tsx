/* eslint-disable @typescript-eslint/unbound-method */
"use client";

import { notEmptyString, useField, useForm } from "@shopify/react-form";
import { parseKennitala } from "is-kennitala";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Plan } from "~/app/queries";
import { Logo } from "~/components/Logo";
import { PlanPicker } from "~/components/PlanPicker";
import { validateEmail } from "~/lib/utils";
import { User } from "~/schema";

import { action } from "../actions";

export function Form({ plans, user }: { plans: Plan[]; user?: User }) {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const [plan, setPlan] = useState(plans[1]!);

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { fields, submit, submitting, submitErrors } = useForm({
    fields: {
      email: useField({
        value: user?.email ?? "",
        validates: (value) => {
          if (!validateEmail(value)) {
            return "Netfang lítur ekki út fyrir að vera rétt skrifað";
          }
        },
      }),
      kennitala: useField({
        value: user?.kennitala ?? "",
        validates: (value) => {
          const kennitala = parseKennitala(value, {
            strictDate: true,
            robot: false,
          });
          if (!kennitala) {
            return "Þetta er ekki gild kennitala";
          }
        },
      }),
      althydufelagid: useField(true),
      name: useField({ value: "", validates: notEmptyString("Nafn vantar") }),
    },
    onSubmit: async ({ althydufelagid, email, kennitala, name }) => {
      const kennitalaData = parseKennitala(kennitala, { robot: false });
      const response = await action({
        althydufelagid,
        email,
        kennitala: kennitalaData!.value,
        name,
        planId: plan.id!.toString(),
        redirectTo,
      });
      if (response) {
        return { status: "fail", errors: [{ message: response.error }] };
      }
      return { status: "success" };
    },
  });

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-xl px-4">
        <form
          onSubmit={(event) => {
            void submit(event);
          }}
          className="space-y-6"
        >
          <Logo />
          <div className="mb-8 space-y-4">
            <h1 className="text-3xl font-black">Áskrift</h1>
            <p>
              Með áskrift að Samstöðinni styrkir fólk þætti og fréttaskrif og
              tryggir einnig að hægt sé að hafa allt efni stöðvarinnar opið.
            </p>
            <p>
              Með áskriftinni getur fólk líka orðið félagar í Alþýðufélaginu,
              sem á og rekur Samstöðina. Samstöðin er eini fjölmiðillinn sem er
              í eigu hlustenda, áhorfenda og lesenda.
            </p>
          </div>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Fullt nafn
            </label>
            <div className="mt-1">
              <input
                value={fields.name.value}
                onChange={fields.name.onChange}
                required
                autoFocus={true}
                name="name"
                autoComplete="name"
                aria-invalid={fields.name.error ? true : undefined}
                aria-describedby="name-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {fields.name.error ? (
                <div className="pt-1 text-red-700" id="name-error">
                  {fields.name.error}
                </div>
              ) : null}
            </div>
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Netfang
            </label>
            <div className="mt-1">
              <input
                value={fields.email.value}
                onChange={fields.email.onChange}
                required
                autoFocus={true}
                type="email"
                autoComplete="email"
                aria-invalid={fields.email.error ? true : undefined}
                aria-describedby="email-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {fields.email.error ? (
                <div className="pt-1 text-red-700" id="email-error">
                  {fields.email.error}
                </div>
              ) : null}
            </div>
          </div>


          <div>
            <label
              htmlFor="kennitala"
              className="block text-sm font-medium text-gray-700"
            >
              Kennitala
            </label>
            <div className="mt-1">
              <input
                value={fields.kennitala.value}
                onChange={fields.kennitala.onChange}
                name="kennitala"
                type="string"
                required
                aria-invalid={fields.kennitala.error ? true : undefined}
                aria-describedby="kennitala-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {fields.kennitala.error ? (
                <div className="pt-1 text-red-700" id="kennitala-error">
                  {fields.kennitala.error}
                </div>
              ) : null}
            </div>
          </div>

          <label className="flex items-baseline gap-2 hover:cursor-pointer">
            <input
              className="h-4 w-4"
              type="checkbox"
              name="althydufelagid"
              checked={fields.althydufelagid.value}
              // eslint-disable-next-line @typescript-eslint/unbound-method
              onChange={fields.althydufelagid.onChange}
            />
            <span className="leading-relaxed">
              Ég vil vera félagi í Alþýðufélaginu
            </span>
          </label>

          {submitErrors[0] ? (
            <div className="pt-1 text-red-700">{submitErrors[0].message}</div>
          ) : null}

          <p>
            Þú getur lagt þín lóð á vogarskálarnar í hverjum mánuði í þremur
            þyngdarflokkum.
          </p>

          <div className="mt-8">
            <PlanPicker plan={plan} plans={plans} setPlan={setPlan} />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-neutral-950 px-4 py-2 text-white hover:bg-black focus:bg-neutral-900"
          >
            Stofna aðgang
          </button>

          <div className="flex items-center justify-center">
            <div className="text-center text-sm text-gray-500">
              Ertu nú þegar með aðgang?{" "}
              <Link
                className="text-blue-500 underline"
                href={{
                  pathname: "/login",
                  search: searchParams.toString(),
                }}
              >
                Innskráning
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
