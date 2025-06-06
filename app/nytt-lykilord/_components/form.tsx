"use client";

import Link from "next/link";
import { useState } from "react";

import { Logo } from "~/components/Logo";

import { setPassword } from "../actions";

export function Form({ token, email }: { token: string; email: string }) {
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        const formData = new FormData(event.target as HTMLFormElement);
        const password = formData.get("password");
        if (typeof password === "string") {
          void setPassword(password, token).then((result) => {
            if (result && "error" in result) {
              setError(result.error);
            }
          });
        }
      }}
      className="space-y-6"
    >
      <Link href="/">
        <Logo />
      </Link>

      <div>
        <label className="block font-semibold text-gray-900">
          Veldu nýtt lykilorð fyrir {email}
        </label>
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
            aria-describedby="password-error"
            className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
          />
          {error ? (
            <div className="pt-1 text-red-700" id="password-error">
              {error}
            </div>
          ) : null}
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded bg-neutral-950 px-4 py-2 text-white hover:bg-black focus:bg-neutral-900"
      >
        Uppfæra lykilorð
      </button>
    </form>
  );
}
