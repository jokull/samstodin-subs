"use client";

import Link from "next/link";
import { redirect } from "next/navigation";
import { useFormState } from "react-dom";

import { login } from "../actions";

export function Form() {
  const [state, action] = useFormState(
    (prevState: unknown, formData: FormData) => {
      return login(prevState, formData).then((result) => {
        if (result === null) {
          redirect("/");
        }
        return result;
      });
    },
    undefined,
  );
  return (
    <form action={action}>
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
            required
            autoFocus={true}
            name="email"
            type="email"
            autoComplete="email"
            aria-describedby="email-error"
            className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
          />
        </div>
        <div className="mt-1 text-right text-sm text-gray-500">
          <Link
            className="text-blue-500 underline"
            href={{
              pathname: "/gleymt-lykilord",
            }}
          >
            Gleymt lykilorð?
          </Link>
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
            autoComplete="current-password"
            aria-describedby="password-error"
            className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
          />
        </div>
      </div>
      {state ? <div className="mt-4 text-red-700">{state.error}</div> : null}
      <div className="mt-4">
        <button
          type="submit"
          className="w-full rounded bg-neutral-950 px-4 py-2 text-white hover:bg-black focus:bg-neutral-900"
        >
          Innskrá
        </button>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center" />
        <div className="text-right text-sm text-gray-500">
          <span className="hidden sm:inline">Ekki með aðgang? </span>
          <Link
            className="text-blue-500 underline cursor-pointer hover:text-blue-700"
            href="/signup"
          >
            Stofna aðgang
          </Link>
        </div>
      </div>
    </form>
  );
}
