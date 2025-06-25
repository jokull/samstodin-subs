"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "~/lib/db";
import { getSession } from "~/lib/session";
import { Settings } from "~/schema";

async function ensureAdmin() {
  const user = await getSession(
    (await cookies()).get("__session")?.value ?? "",
  );
  if (!user?.isAdmin) {
    redirect("/");
  }
  return user;
}

export async function updateOpenGraphImage(imageUrl: string | null) {
  await ensureAdmin();

  const existingSetting = await db
    .select()
    .from(Settings)
    .where(eq(Settings.key, "opengraph_image_url"))
    .limit(1);

  if (existingSetting.length > 0) {
    await db
      .update(Settings)
      .set({
        value: imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(Settings.key, "opengraph_image_url"));
  } else {
    await db.insert(Settings).values({
      key: "opengraph_image_url",
      value: imageUrl,
      updatedAt: new Date(),
    });
  }

  revalidatePath("/admin/settings");
}