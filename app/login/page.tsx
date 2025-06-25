import Link from "next/link";
import { Suspense } from "react";

import { Logo } from "~/components/Logo";

import LoginContent from "./_components/login-content";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="flex min-h-full flex-col justify-center">
        <Link href={{ pathname: "/" }} className="mb-4 block">
          <Logo />
        </Link>
        <Suspense fallback={<div>Loading...</div>}>
          <LoginContent />
        </Suspense>
      </div>
    </div>
  );
}
