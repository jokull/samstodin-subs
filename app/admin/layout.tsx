import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

import { getSession } from "~/lib/session";

import Nav from "./_components/nav";

export default async function Page({ children }: { children: ReactNode }) {
  const user = await getSession(
    (await cookies()).get("__session")?.value ?? "",
  );
  if (!user?.isAdmin) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "/admin";
    redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  }

  return (
    <div className="mx-auto flex h-full min-h-screen flex-col px-4 sm:px-6 lg:px-8">
      <header className="flex w-full items-center justify-between gap-4 py-4 text-black">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
          <a
            href="https://askrift.samstodin.is/"
            className="flex items-center gap-2 text-xl font-black"
          >
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
        <Nav />
        <div className="flex flex-col items-end sm:flex-row sm:items-center sm:gap-4">
          <p>{user.email}</p>
          <form action="/logout" method="post">
            <button type="submit" className="underline">
              Útskrá
            </button>
          </form>
        </div>
      </header>
      <div className="">
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
