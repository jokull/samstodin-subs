import type { z } from "zod";

import { env } from "~/env";
import type { schemas } from "~/lib/askell";
import { createApiClient } from "~/lib/askell";

export type Subscription = z.infer<typeof schemas.Subscription>;

export const askell = createApiClient("https://askell.is/api", {
  axiosConfig: {
    headers: { Authorization: `Api-Key ${env.ASKELL_PRIVATE}` },
  },
});
