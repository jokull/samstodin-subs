/* eslint-disable @typescript-eslint/unbound-method */
"use client";

import { notEmptyString, useField, useForm } from "@shopify/react-form";
import { parseKennitala } from "is-kennitala";

import { Logo } from "~/components/Logo";

import { createProfile } from "./profile-actions";

export function ProfileForm() {
  const { fields, submit, submitErrors, submitting } = useForm({
    fields: {
      kennitala: useField({
        value: "",
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
    onSubmit: async ({ althydufelagid, kennitala, name }) => {
      const kennitalaData = parseKennitala(kennitala, { robot: false });
      const response = await createProfile({
        althydufelagid,
        kennitala: kennitalaData!.value,
        name,
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

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-neutral-950 px-4 py-2 text-white hover:bg-black focus:bg-neutral-900"
          >
            Áfram
          </button>
        </form>
      </div>
    </div>
  );
}
