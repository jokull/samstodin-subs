"use server";

import { KennitalaData } from "is-kennitala";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  createUser,
  getUserByEmail,
  getUserByKennitala,
} from "~/lib/queries/users";
import { getSealedEmail } from "~/lib/session";

export async function createProfile({
  althydufelagid,
  kennitala,
  name,
  password,
}: {
  kennitala: KennitalaData["value"];
  althydufelagid: boolean;
  name: string;
  password?: string;
}) {
  const email = await getSealedEmail(
    (await cookies()).get("__session")?.value ?? "",
  );

  if (!email) {
    redirect("/login");
  }

  let existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "Notandi með þetta netfang er nú þegar með aðgang" };
  }

  existingUser = await getUserByKennitala(kennitala);
  if (existingUser) {
    return { error: "Notandi með þessa kennitölu er nú þegar með aðgang" };
  }

  await createUser({
    email,
    kennitala,
    name,
    althydufelagid,
    password,
  });

  revalidatePath("/");
}
