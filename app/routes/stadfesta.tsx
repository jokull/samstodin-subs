import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";

import { Logo } from "~/components/Logo";
import { createUser } from "~/models/user.server";
import { createUserSession } from "~/session.server";
import { getTokenData } from "~/tokens.server";

function getTokenDataFromRequest(request: Request) {
  const externalDomain = process.env.EXTERNAL_HOST ?? "localhost";
  const url = new URL(request.url, `https://${externalDomain}/`);
  const token = url.searchParams.get("token") ?? "";
  return getTokenData(token);
}

export const loader = async ({ request }: LoaderArgs) => {
  const result = await getTokenDataFromRequest(request);

  if (!result.success) {
    return new Response("Error", { status: 403 });
  }

  return json(result.data);
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();

  const password = formData.get("password");
  if (typeof password !== "string" || password.length === 0) {
    return json(
      {
        errors: {
          kennitala: null,
          email: null,
          password: "Lykilorð vantar",
        },
      },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return json(
      {
        errors: {
          kennitala: null,
          email: null,
          password: "Lykilorðið er of stutt",
        },
      },
      { status: 400 }
    );
  }

  const result = await getTokenDataFromRequest(request);

  if (!result.success) {
    throw new Error("Not valid form data");
  }

  const { althydufelagid, email, kennitala, name, subscriptionId } =
    result.data;

  const user = await createUser({
    email,
    password,
    kennitala,
    althydufelagid,
    name,
  });
  const externalDomain = process.env.EXTERNAL_HOST ?? "localhost";
  const redirectUri = `https://${externalDomain}/`;

  return createUserSession({
    redirectTo: `https://askell.is/subscribe-button/${subscriptionId}/?reference=${
      user.kennitala
    }&redirect=${encodeURIComponent(redirectUri)}`,
    remember: true,
    request,
    userId: user.id,
  });
};

export default function Stadfesta() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-4">
        <Form method="post" className="space-y-6">
          <Logo />

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Netfang
            </label>
            <div className="mt-1">
              <input
                id="email"
                readOnly
                defaultValue={data.email}
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Lykilorð
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="password-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.password ? (
                <div className="pt-1 text-red-700" id="password-error">
                  {actionData.errors.password}
                </div>
              ) : null}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded bg-neutral-950 px-4 py-2 text-white hover:bg-black focus:bg-neutral-900"
          >
            Stofna aðgang
          </button>
        </Form>
      </div>
    </div>
  );
}
