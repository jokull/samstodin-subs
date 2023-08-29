import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useRef } from "react";
import type { Subscription } from "~/api";
import { getApi } from "~/api";
import { Header } from "~/components/Header";

import { getUser } from "~/session.server";
import {
  formatCurrencyIcelandic,
  getApexDomain,
  useOptionalUser,
} from "~/utils";

export const meta: V2_MetaFunction = () => [{ title: "Áskriftir - Samstöðin" }];

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
      const subscriptionId = formData.get("subscriptionId");
      const redirectUri = `https://${externalDomain}/`;
      return redirect(
        user
          ? `https://askell.is/subscribe-button/${subscriptionId}/?reference=${
              user.kennitala
            }&redirect=${encodeURIComponent(redirectUri)}`
          : `/askrift`
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
  if (!user) {
    return redirect("/askrift");
  }
  const askell = getApi();

  const plans = await askell.get("/plans/");
  let subscription: Subscription | null = null;
  if (user) {
    try {
      const subscriptions = await askell.get(
        "/customers/:customerReference/subscriptions/",
        {
          params: { customerReference: user.kennitala },
        }
      );
      subscription = subscriptions.find(({ active }) => active) ?? null;
    } catch (error) {
      subscription = null;
    }
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
      <div className="px-4">
        <Header user={user} />
      </div>

      <main className="bg-white p-4 h-full">
        <div className="space-y-4 mb-8">
          <h1 className="text-3xl font-black">Áskrift</h1>
          <p>
            Með áskrift að Samstöðinni styrkir fólk þætti og fréttaskrif og
            tryggir einnig að hægt sé að hafa allt efni stöðvarinnar opið.
          </p>
          <p>
            Með áskriftinni getur fólk líka orðið félagar í Alþýðufélaginu, sem
            á og rekur Samstöðina. Samstöðin er eini fjölmiðillinn sem er í eigu
            hlustenda, áhorfenda og lesenda.
          </p>
        </div>
        {data.subscription ? (
          <div className="space-y-4 mb-8">
            <p className="font-bold">Þú ert með áskrift að Samstöðinni.</p>
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
            <p className="mb-8">
              Til að breyta um upphæð þarf að segja upp áskrift fyrst og skrá
              þig svo aftur.
            </p>
            <div>
              <>
                <a
                  className="underline"
                  target="_blank"
                  href={`https://askell.is/change_subscription/${
                    data.subscription.token ?? ""
                  }`}
                  rel="noreferrer"
                >
                  Uppfæra greiðslumáta
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
          </div>
        ) : (
          <div>
            {data.plans.length === 0 ? (
              <p className="p-4">Engar áskriftir í boði</p>
            ) : (
              <Form method="POST" action="/?index">
                <label className="flex items-baseline gap-2 hover:cursor-pointer mb-4">
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
                  Þú getur lagt þín lóð á vogarskálarnar í hverjum mánuði í
                  þremur þyngdarflokkum.
                </p>
                <input type="hidden" name="intent" value="subscribe" />
                <input type="hidden" name="subscriptionId" ref={subRef} />
                <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-4 md:gap-8">
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
                </div>
              </Form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
