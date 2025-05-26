"use client";

import Link from "next/link";

export function Header({ email }: { email?: string }) {
  return (
    <header className="flex w-full items-center justify-between gap-4 py-4 text-black">
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
        <a
          href="https://askrift.samstodin.is/"
          className="flex items-center gap-2 text-xl font-black"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
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
      <div className="flex flex-col items-end sm:flex-row sm:items-center sm:gap-4">
        {email ? (
          <>
            <p>{email}</p>
            <form action="/logout" method="post">
              <button type="submit" className="underline">
                Útskrá
              </button>
            </form>
          </>
        ) : (
          <Link href="/login">Innskráning</Link>
        )}
      </div>
    </header>
  );
}
