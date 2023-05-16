import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { useRef } from "react";
import type { Subscription } from "~/api";
import { getApi } from "~/api";

import { getUser } from "~/session.server";
import { useOptionalUser } from "~/utils";

export const meta: V2_MetaFunction = () => [{ title: "Áskriftir - Samstöðin" }];

function formatCurrencyIcelandic(input: string): string {
  const numberValue = parseFloat(input);

  const formatter = new Intl.NumberFormat("is-IS", {
    style: "currency",
    currency: "ISK",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  });

  return formatter.format(numberValue).replace("kr.", "kr");
}

function getApexDomain(hostname: string) {
  const domainParts = hostname.split(".");

  if (domainParts.length < 2) {
    return null;
  }

  return domainParts.slice(-2).join(".");
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const user = await getUser(request);
  switch (intent) {
    case "unsubscribe": {
      if (!user) {
        throw new Error("no user");
      }
      const askell = getApi();
      await askell.post("/subscriptions/:subscriptionId/cancel/", {} as never, {
        params: { subscriptionId: `${formData.get("subscriptionId")}` },
      });
      return redirect(request.url);
    }
    case "subscribe": {
      const externalDomain = process.env.EXTERNAL_HOST ?? "localhost";
      const redirectUri = `https://${externalDomain}/`;
      return redirect(
        user
          ? `https://askell.is/subscribe-button/${formData.get(
              "subscriptionId"
            )}/?reference=${user.kennitala}&redirect=${encodeURIComponent(
              redirectUri
            )}`
          : `/join`
      );
    }
    default: {
      throw new Error("Unexpected action");
    }
  }
}

function getAskriftCookieValue(domain: string, value: string) {
  // Get the current date
  let date = new Date();

  // Set it to one year in the future
  date.setFullYear(date.getFullYear() + 1);

  // Format the date string in the correct format
  let dateString = date.toUTCString();

  // Generate the Set-Cookie header
  let header = `askrift=${value}; Expires=${dateString}; Domain=${domain}; Path=/; SameSite=Lax;`;

  // Return the header
  return header;
}

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUser(request);
  const askell = getApi();

  const plans = await askell.get("/plans/");
  let subscription: Subscription | null = null;
  if (user) {
    const subscriptions = await askell.get(
      "/customers/:customerReference/subscriptions/",
      {
        params: { customerReference: user.kennitala },
      }
    );
    subscription = subscriptions.find(({ active }) => active) ?? null;
  }

  const cookieDomain = `.${getApexDomain(
    process.env.EXTERNAL_HOST ?? "localhost"
  )}`;

  return json(
    { plans, user, subscription },
    {
      headers: user
        ? {
            "Set-Cookie": getAskriftCookieValue(
              cookieDomain,
              JSON.stringify({
                email: user.email,
                hasSubscription: !!subscription,
              })
            ),
          }
        : {},
    }
  );
};

export default function AskriftirPage() {
  const data = useLoaderData<typeof loader>();
  const user = useOptionalUser();
  const subRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex h-full min-h-screen max-w-2xl mx-auto flex-col">
      <header className="flex w-full items-center justify-between gap-4 p-4 text-black">
        <div className="flex flex-col sm:flex-row sm:gap-4 sm:items-center">
          <a
            href="https://samstodin.is/"
            className="flex gap-2 items-center font-black text-xl"
          >
            <img
              src="/samstodin-logo-black.svg"
              width={91 / 3}
              height={72 / 3}
              className="mb-0.5"
              alt="Merki Samstöðvarinnar"
            />
            <h1>Samstöðin</h1>
          </a>
        </div>
        <div className="flex flex-col sm:flex-row sm:gap-4 items-end sm:items-center">
          {user ? (
            <>
              <p>{user.email}</p>
              <Form action="/logout" method="post">
                <button type="submit" className="underline">
                  Útskrá
                </button>
              </Form>
            </>
          ) : (
            <Link to="/login">Innskráning</Link>
          )}
        </div>
      </header>

      <main className="bg-white p-4 h-full">
        <div className="space-y-4 mb-8">
          <h1 className="text-3xl font-black">Skráning</h1>
          <p>
            Alþýðufélagið styrkir Samstöðina. Alþýðufélagið hefur það markmið að
            auðga og bæta umræðu í samfélaginu. Allir geta gengið í
            Alþýðufélagið og styrkt þar með efni og útbreiðslu Samstöðvarinnar.
          </p>
          <p>
            <strong>
              Þú getur lagt þín lóð á vogarskálarnir í hverjum mánuði í þremur
              þyngdarflokkum.
            </strong>{" "}
            Félagsgjöld eru innheimt með greiðsluseðli í heimabanka.
          </p>
        </div>
        {data.subscription ? (
          <div className="space-y-4 mb-8">
            <p>Þú ert með áskrift að Samstöðinni.</p>
            {data.subscription.active_until ? (
              <p>
                {data.subscription.ended_at
                  ? "Áskriftinni hefur verið hætt og rennur hún út"
                  : "Áskriftin verður næst endurnýjuð sjálfkrafa"}{" "}
                {new Date(
                  Date.parse(data.subscription.active_until)
                ).toLocaleDateString("is-IS", {
                  dateStyle: "long",
                })}
              </p>
            ) : null}
            <>
              <a
                className="underline"
                target="_blank"
                href={`https://askell.is/change_subscription/${
                  data.subscription.token ?? ""
                }`}
                rel="noreferrer"
              >
                Breyta greiðslu
              </a>{" "}
              eða{" "}
              <Form action="/?index" method="POST" className="inline">
                <input type="hidden" name="intent" value="unsubscribe" />
                <input
                  type="hidden"
                  name="subscriptionId"
                  value={data.subscription.id ?? ""}
                />
                <button className="underline">segja upp áskrift</button>
              </Form>
            </>
          </div>
        ) : (
          <div>
            {data.plans.length === 0 ? (
              <p className="p-4">Engar áskriftir í boði</p>
            ) : (
              <Form
                method="POST"
                action="/?index"
                className="flex justify-center gap-2 sm:gap-4 md:gap-8"
              >
                <input type="hidden" name="intent" value="subscribe" />
                <input type="hidden" name="subscriptionId" ref={subRef} />
                {data.plans.map(({ amount, id }) => (
                  <button
                    onClick={() => {
                      if (subRef.current) {
                        subRef.current.value = `${id}`;
                      }
                    }}
                    key={id}
                    className="rounded-md border-[1.5px] border-black font-black px-4 pt-2 pb-1.5 bg-white hover:-translate-y-1 hover:shadow-lg hover:scale-105 shadow-black/5 transition-transform"
                  >
                    {formatCurrencyIcelandic(amount!)}
                  </button>
                ))}
              </Form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
