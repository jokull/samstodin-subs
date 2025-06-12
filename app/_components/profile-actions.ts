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
  try {
    const email = await getSealedEmail(
      (await cookies()).get("__session")?.value ?? "",
    );

    console.log(
      `[createProfile] Action started for email: ${email ?? "Not found in session"}`,
    );

    if (!email) {
      console.log(
        "[createProfile] No email in session, redirecting to /login.",
      );
      return redirect("/login");
    }

    let existingUser = await getUserByEmail(email);
    if (existingUser) {
      console.warn(`[createProfile] User with email ${email} already exists.`);
      return { error: "Notandi með þetta netfang er nú þegar með aðgang" };
    }

    existingUser = await getUserByKennitala(kennitala);
    if (existingUser) {
      console.warn(
        `[createProfile] User with kennitala ${kennitala} already exists.`,
      );
      return { error: "Notandi með þessa kennitölu er nú þegar með aðgang" };
    }

    console.log(`[createProfile] Creating new user profile for ${email}.`);
    await createUser({
      email,
      kennitala,
      name,
      althydufelagid,
      password,
    });
    console.log(
      `[createProfile] User profile created successfully for ${email}.`,
    );

    revalidatePath("/");

    // --- CRITICAL FIX STARTS HERE ---
    // Restore proper navigation to complete user flow
    console.log(`[createProfile] Redirecting user ${email} to /.`);
    return redirect("/");
    // --- FIX ENDS HERE ---
  } catch (error) {
    console.error("[createProfile] An unexpected error occurred:", error);
    return { error: "Óvænt villa kom upp. Vinsamlegast reynið aftur." };
  }
}
