"use client";

import Link from "next/link";

import { Logo } from "~/components/Logo";

import { startGoogleAuthFlow } from "../_components/signup-actions";
import { Form } from "./_components/form";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="flex min-h-full flex-col justify-center">
        <Link href={{ pathname: "/" }} className="mb-4 block">
          <Logo />
        </Link>
        <button
          className="w-full rounded bg-neutral-950 px-4 py-2 text-white hover:bg-black focus:bg-neutral-900"
          type="button"
          onClick={() => {
            // starts a redirect flow
            void startGoogleAuthFlow();
          }}
        >
          Google Innskráning
        </button>
        <div className="my-8 text-center">— eða —</div>
        <Form />
      </div>
    </div>
  );
}
