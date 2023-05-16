import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { createCookie, json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import type { z } from "zod";
import type { schemas } from "~/askell";
import { createApiClient } from "~/askell";
import { getUserById } from "~/models/user.server";

import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";

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

type Subscription = z.infer<typeof schemas.Subscription>;

function getApi() {
  return createApiClient("https://askell.is/api", {
    axiosConfig: {
      headers: { Authorization: `Api-Key ${process.env.ASKELL_PRIVATE ?? ""}` },
    },
  });
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const userId = await requireUserId(request);
  const user = await getUserById(userId);
  if (!user) {
    throw new Error("no user");
  }
  switch (intent) {
    case "unsubscribe": {
      const askell = getApi();
      await askell.post("/subscriptions/:subscriptionId/cancel/", {} as never, {
        params: { subscriptionId: `${formData.get("subscriptionId")}` },
      });
      return redirect(request.url);
    }
    default: {
      throw new Error("Unexpected action");
    }
  }
}

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);
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

  const externalDomain = process.env.EXTERNAL_HOST ?? "localhost";

  return json(
    { plans, user, subscription, externalDomain },
    {
      headers: user
        ? {
            "Set-Cookie": await createCookie("user", {
              sameSite: "lax",
              domain: `.${getApexDomain(externalDomain)}`,
            }).serialize(
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
  const user = useUser();
  const redirectUri = `https://${data.externalDomain}/askriftir`;

  console.log({ redirectUri });

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex w-full items-center justify-between gap-4 p-4 text-black">
        <h1 className="text-3xl font-bold">
          <Link to=".">Áskriftir</Link>
        </h1>
        <div className="flex gap-4 items-center">
          <p>{user.email}</p>
          <Form action="/logout" method="post">
            <button type="submit" className="underline">
              Útskrá
            </button>
          </Form>
        </div>
      </header>

      <main className="bg-white p-4 h-full">
        {data.subscription ? (
          <div className="space-y-4">
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
            <p>
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
              <Form action="./" method="POST" className="inline">
                <input type="hidden" name="intent" value="unsubscribe" />
                <input
                  type="hidden"
                  name="subscriptionId"
                  value={data.subscription.id ?? ""}
                />
                <button className="underline">segja upp áskrift</button>
              </Form>
            </p>
          </div>
        ) : (
          <div>
            {data.plans.length === 0 ? (
              <p className="p-4">Engar áskriftir í boði</p>
            ) : (
              <div className="flex justify-center gap-8">
                {data.plans.map(({ amount, id }) => (
                  <a
                    key={id}
                    className="rounded-md border-[1.5px] border-black font-black px-4 pt-2 pb-1.5 bg-white hover:-translate-y-1 hover:shadow-lg hover:scale-105 shadow-black/5 transition-transform"
                    href={`https://askell.is/subscribe-button/${id}/?reference=${"1803862709"}&redirect=${encodeURIComponent(
                      redirectUri
                    )}`}
                  >
                    {formatCurrencyIcelandic(amount!)}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* <div className="flex-1 p-6">
          <Outlet />
        </div> */}
      </main>
    </div>
  );
}
