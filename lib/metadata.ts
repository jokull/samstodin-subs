import { eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "./db";
import { Settings } from "~/schema";

export const getOpenGraphImage = cache(async (): Promise<string | null> => {
  const setting = await db.query.Settings.findFirst({
    where: eq(Settings.key, "opengraph_image_url"),
  });
  
  return setting?.value || null;
});