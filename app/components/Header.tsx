import { Form, Link } from "@remix-run/react";
import type { useUser } from "~/utils";

export function Header({ user }: { user?: ReturnType<typeof useUser> }) {
  return (
    <header className="flex w-full items-center justify-between gap-4 py-4 text-black">
      <div className="flex flex-col sm:flex-row sm:gap-4 sm:items-center">
        <a
          href="https://samstodin.is/"
          className="flex gap-2 items-center font-black text-xl"
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
      <div className="flex flex-col sm:flex-row sm:gap-4 items-end sm:items-center">
        {user ? (
          <>
            <p>{user.email}</p>
            <Form action="/logout" method="post">
              <button type="submit" className="underline">
                Útskrá
              </button>
            </Form>
          </>
        ) : (
          <Link to="/login">Innskráning</Link>
        )}
      </div>
    </header>
  );
}
