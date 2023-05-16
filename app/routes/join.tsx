import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { Logo } from "~/components/Logo";
import { isValidKennitala } from "~/kennitala";

import {
  createUser,
  getUserByEmail,
  getUserByKennitala,
} from "~/models/user.server";
import { createUserSession, getUserId } from "~/session.server";
import { safeRedirect, validateEmail } from "~/utils";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const kennitala = formData.get("kennitala");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");

  if (!validateEmail(email)) {
    return json(
      {
        errors: {
          email: "Netfang lítur ekki út fyrir að vera rétt skrifað",
          password: null,
          kennitala: null,
        },
      },
      { status: 400 }
    );
  }

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

  if (typeof kennitala !== "string" || !isValidKennitala(kennitala)) {
    return json(
      {
        errors: {
          kennitala: "Þetta er ekki gild kennitala",
          email: null,
          password: null,
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
          password: null,
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
          password: null,
        },
      },
      { status: 400 }
    );
  }

  const user = await createUser(email, password, kennitala);

  return createUserSession({
    redirectTo,
    remember: false,
    request,
    userId: user.id,
  });
};

export const meta: V2_MetaFunction = () => [
  { title: "Nýskráning - Samstöðin" },
];

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData<typeof action>();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
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
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Lykilorð
            </label>
            <div className="mt-1">
              <input
                id="password"
                ref={passwordRef}
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
                ref={passwordRef}
                name="kennitala"
                type="string"
                required
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

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button
            type="submit"
            className="w-full rounded bg-neutral-950 px-4 py-2 text-white hover:bg-black focus:bg-neutral-900"
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
