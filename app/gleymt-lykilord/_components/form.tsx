"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { Logo } from "~/components/Logo";

import { requestPassword } from "../actions";

export function Form() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        const formData = new FormData(event.target as HTMLFormElement);
        const email = formData.get("email");
        if (typeof email === "string") {
          startTransition(() => {
            void requestPassword(email).then((result) => {
              if (result && "error" in result) {
                setError(result.error);
              } else {
                setSuccess(true);
              }
            });
          });
        }
      }}
      className="space-y-6"
    >
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
            required
            autoFocus={true}
            name="email"
            type="email"
            autoComplete="email"
            aria-describedby="email-error"
            className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
          />
          {error ? (
            <div className="pt-1 text-red-700" id="email-error">
              {error}
            </div>
          ) : null}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded bg-neutral-950 px-4 py-2 text-white hover:bg-black focus:bg-neutral-900 disabled:opacity-50"
      >
        Endurstilla lykilorð
      </button>
      {success === true ? (
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
            href={{
              pathname: "/",
              search: searchParams.toString(),
            }}
          >
            Stofna aðgang
          </Link>
        </div>
      </div>
    </form>
  );
}
