import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getSession } from "~/lib/session";

import { getPlans } from "../queries";
import { Form } from "./_components/form";

export default async function Askrift() {
  const plans = await getPlans();
  const user = await getSession(cookies());
  if (user) {
    redirect("/");
  }
  return <Form plans={plans} />;
}
