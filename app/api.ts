import type { z } from "zod";
import type { schemas } from "~/askell";
import { createApiClient } from "~/askell";

export type Subscription = z.infer<typeof schemas.Subscription>;

export function getApi() {
  return createApiClient("https://askell.is/api", {
    axiosConfig: {
      headers: { Authorization: `Api-Key ${process.env.ASKELL_PRIVATE ?? ""}` },
    },
  });
}
