import { eq } from "drizzle-orm";
import { cache } from "react";

import { Settings } from "~/schema";

import { db } from "./db";

export const getOpenGraphImage = cache(async (): Promise<string | null> => {
  const setting = await db.query.Settings.findFirst({
    where: eq(Settings.key, "opengraph_image_url"),
  });

  return setting?.value || null;
});

export const getHeroImage = cache(async (): Promise<string | null> => {
  const setting = await db.query.Settings.findFirst({
    where: eq(Settings.key, "hero_image_url"),
  });

  return setting?.value || null;
});
