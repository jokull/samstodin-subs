import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";

import { useEffect, useRef, useState } from "react";
import { getApi } from "~/api";
import { Logo } from "~/components/Logo";
import { isValidKennitala } from "~/kennitala";

import { getUserByEmail, getUserByKennitala } from "~/models/user.server";
import { sendEmail } from "~/samstodin";
import { getUserId } from "~/session.server";
import { getToken } from "~/tokens.server";
import { formatCurrencyIcelandic, validateEmail } from "~/utils";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");

  const askell = getApi();
  const plans = await askell.get("/plans/");

  return json({ plans });
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const kennitala = (formData.get("kennitala")?.toString() ?? "").replace(
    /-/g,
    ""
  );
  const althydufelagid = formData.get("althydufelagid") === "on";
  const name = formData.get("name");
  const subscriptionId = formData.get("subscriptionId");

  if (typeof name !== "string" || name.length < 1) {
    return json(
      {
        errors: {
          email: null,
          kennitala: null,
          name: "Nafn vantar",
        },
      },
      { status: 400 }
    );
  }

  if (typeof subscriptionId !== "string") {
    throw new Error("Subscription id missing");
  }

  if (!validateEmail(email)) {
    return json(
      {
        errors: {
          email: "Netfang lítur ekki út fyrir að vera rétt skrifað",
          kennitala: null,
          name: null,
        },
      },
      { status: 400 }
    );
  }

  if (typeof kennitala !== "string" || !isValidKennitala(kennitala)) {
    return json(
      {
        errors: {
          kennitala: "Þetta er ekki gild kennitala",
          email: null,
          name: null,
        },
      },
      { status: 400 }
    );
  }

  let existingUser = await getUserByEmail(email);
  if (existingUser) {
    return json(
      {
        errors: {
          kennitala: null,
          email: "Notandi með þetta netfang er nú þegar með aðgang",
          name: null,
        },
      },
      { status: 400 }
    );
  }

  existingUser = await getUserByKennitala(kennitala);
  if (existingUser) {
    return json(
      {
        errors: {
          kennitala: "Notandi með þessa kennitölu er nú þegar með aðgang",
          email: null,
          name: null,
        },
      },
      { status: 400 }
    );
  }

  const token = await getToken({
    email,
    kennitala,
    althydufelagid,
    name,
    subscriptionId,
  });
  const tokenUrl = `https://${process.env.EXTERNAL_HOST}/stadfesta?token=${token}`;

  if (process.env.EXTERNAL_HOST !== "samstodin-subs.solberg.is") {
    const emailText = "Staðfestu skráningu";
    const emailHtml = `<a href="${tokenUrl}">Staðfestu skráningu</a>`;
    await sendEmail(email, emailText, tokenUrl, emailHtml);
  } else {
    console.debug({ tokenUrl });
  }

  return redirect("/stadfesting");
};

export const meta: V2_MetaFunction = () => [{ title: "Áskrift - Samstöðin" }];

export default function Askrift() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const kennitalaRef = useRef<HTMLInputElement>(null);
  const [subscriptionId, setSubscriptionId] = useState(data.plans[1].id ?? 0);

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.kennitala) {
      kennitalaRef.current?.focus();
    } else if (actionData?.errors?.name) {
      nameRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-xl px-4">
        <Form method="post" className="space-y-6">
          <Logo />
          <div className="space-y-4 mb-8">
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
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Netfang
            </label>
            <div className="mt-1">
              <input
                ref={emailRef}
                id="email"
                required
                autoFocus={true}
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={actionData?.errors?.email ? true : undefined}
                aria-describedby="email-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.email ? (
                <div className="pt-1 text-red-700" id="email-error">
                  {actionData.errors.email}
                </div>
              ) : null}
            </div>
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
                ref={nameRef}
                id="name"
                required
                autoFocus={true}
                name="name"
                autoComplete="name"
                aria-invalid={actionData?.errors?.name ? true : undefined}
                aria-describedby="name-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.name ? (
                <div className="pt-1 text-red-700" id="name-error">
                  {actionData.errors.name}
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
                id="kennitala"
                name="kennitala"
                type="string"
                required
                ref={kennitalaRef}
                aria-invalid={actionData?.errors?.kennitala ? true : undefined}
                aria-describedby="kennitala-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.kennitala ? (
                <div className="pt-1 text-red-700" id="kennitala-error">
                  {actionData.errors.kennitala}
                </div>
              ) : null}
            </div>
          </div>

          <label className="flex items-baseline gap-2 hover:cursor-pointer">
            <input
              className="w-4 h-4"
              type="checkbox"
              name="althydufelagid"
              defaultChecked
            />
            <span className="leading-relaxed">
              Ég vil vera félagi í Alþýðufélaginu
            </span>
          </label>

          <p>
            Þú getur lagt þín lóð á vogarskálarnar í hverjum mánuði í þremur
            þyngdarflokkum.
          </p>
          <input type="hidden" name="intent" value="subscribe" />
          <input type="hidden" name="subscriptionId" value={subscriptionId} />
          <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-4 md:gap-8">
            {data.plans.map(({ amount, id }) => (
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  setSubscriptionId(id!);
                }}
                key={id}
                className={`rounded-md font-black border-[1.5px] border-black px-4 pt-2 pb-1.5 hover:-translate-y-1 hover:shadow-lg hover:scale-105 shadow-black/5 transition-transform ${
                  subscriptionId === id ? "bg-black text-white" : "bg-white"
                }`}
              >
                {formatCurrencyIcelandic(amount!)}
              </button>
            ))}
          </div>

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button
            type="submit"
            className="w-full rounded-md bg-neutral-950 px-4 py-2 text-white hover:bg-black focus:bg-neutral-900"
          >
            Stofna aðgang
          </button>
          <div className="flex items-center justify-center">
            <div className="text-center text-sm text-gray-500">
              Ertu nú þegar með aðgang?{" "}
              <Link
                className="text-blue-500 underline"
                to={{
                  pathname: "/login",
                  search: searchParams.toString(),
                }}
              >
                Innskráning
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
