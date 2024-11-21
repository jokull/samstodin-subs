import { notFound } from "next/navigation";

import { getSession } from "~/lib/session";

import { Form } from "./_components/form";

export default async function Page({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const token = searchParams.token;

  if (!token) {
    notFound();
  }

  const user = await getSession(token);

  if (!user) {
    notFound();
  }

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-4">
        <Form token={token} email={user.email} />
      </div>
    </div>
  );
}
