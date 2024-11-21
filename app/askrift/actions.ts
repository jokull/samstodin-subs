"use server";

import { redirect } from "next/navigation";

import { getUserByEmail, getUserByKennitala } from "~/lib/queries/users";
import { sendEmail } from "~/lib/samstodin";
import { getToken } from "~/lib/signup";

export async function action({
  althydufelagid,
  email,
  kennitala,
  name,
  planId,
}: {
  kennitala: string;
  email: string;
  althydufelagid: boolean;
  name: string;
  planId: string;
  redirectTo?: string;
}) {
  let existingUser = await getUserByEmail(email);
  if (existingUser) {
    return { error: "Notandi með þetta netfang er nú þegar með aðgang" };
  }
  existingUser = await getUserByKennitala(kennitala);
  if (existingUser) {
    return { error: "Notandi með þessa kennitölu er nú þegar með aðgang" };
  }

  const token = await getToken({
    email,
    kennitala,
    althydufelagid,
    name,
    planId,
  });
  const tokenUrl = `https://${process.env.EXTERNAL_HOST}/stadfesta?token=${token}`;

  if (process.env.EXTERNAL_HOST !== "samstodin-subs.solberg.is") {
    const emailText = `Staðfestu skráningu: ${tokenUrl}`;
    const emailHtml = `<a href="${tokenUrl}">Staðfestu skráningu</a>`;
    await sendEmail(email, "Staðfestu skráningu", emailText, emailHtml);
  } else {
    console.debug({ tokenUrl });
  }

  redirect("/stadfesting");
}
