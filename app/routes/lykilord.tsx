import type { ActionArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { Logo } from "~/components/Logo";

import { getUserByEmail } from "~/models/user.server";
import { getPasswordResetToken } from "~/password-reset-tokens.server";
import { sendEmail } from "~/samstodin";
import { validateEmail } from "~/utils";

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email");

  if (!validateEmail(email)) {
    return json({ errors: { email: "Email is invalid" } }, { status: 400 });
  }

  const user = await getUserByEmail(email);

  if (!user) {
    return json(
      { errors: { email: "Invalid email or password" } },
      { status: 400 }
    );
  }

  const token = await getPasswordResetToken({ email });
  const tokenUrl = `https://${process.env.EXTERNAL_HOST}/nytt-lykilord?token=${token}`;

  await sendEmail(
    user.email,
    "Endurstill lykilorð",
    tokenUrl,
    `<a href="${tokenUrl}">Endurstilla</a>`
  );

  return json({ errors: null });
};

export const meta: V2_MetaFunction = () => [
  { title: "Endurstilla lykilorð - Samstöðin" },
];

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const actionData = useActionData<typeof action>();
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    }
  }, [actionData]);

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

          <button
            type="submit"
            className="w-full rounded bg-neutral-950 px-4 py-2 text-white hover:bg-black focus:bg-neutral-900"
          >
            Endurstilla lykilorð
          </button>
          {actionData?.errors === null ? (
            <div className="my-4 font-medium">
              Þú færð núna tölvupóst með hlekk til staðfestingar. Í næsta skrefi
              eftir það velur þú nýtt lykilorð.
            </div>
          ) : null}
          <div className="flex items-center justify-between">
            <div className="flex items-center"></div>
            <div className="text-right text-sm text-gray-500">
              <span className="hidden sm:inline">Ekki með aðgang?</span>
              <Link
                className="text-blue-500 underline"
                to={{
                  pathname: "/askrift",
                  search: searchParams.toString(),
                }}
              >
                Stofna aðgang
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
