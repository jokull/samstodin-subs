import { notFound } from "next/navigation";

import { getSignup } from "~/lib/signup";

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

  const result = await getSignup(token);

  if (!result.success) {
    notFound();
  }

  const data = result.data;

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-4">
        <Form token={token} email={data.email} />
      </div>
    </div>
  );
}
