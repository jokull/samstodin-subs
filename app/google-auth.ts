import { encodeBase64url } from "@oslojs/encoding";
import {
  joseAlgorithmRS256,
  JWSRegisteredHeaders,
  JWTRegisteredClaims,
  parseJWT,
} from "@oslojs/jwt";
import { err, ok } from "neverthrow";
import { z } from "zod";

import { safeFetch, safeZodParse } from "./safe";

const tokenResponseSchema = z.object({
  id_token: z.string(),
  access_token: z.string().optional(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
  token_type: z.string().optional(),
  expires_in: z.number().optional(),
});

const googleIdTokenPayloadSchema = z.object({
  sub: z.string(),
  email: z.string().email(),
  email_verified: z.boolean().optional(),
  name: z.string().optional(),
  picture: z.string().url().optional(),
});

const REDIRECT_URI = `https://${process.env.NEXT_PUBLIC_VERCEL_URL!}/callback`;

const oauth_google = {
  endpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  scopes: ["openid", "email", "profile"],
};

export function getGoogleAuthUrl({ redirect }: { redirect?: string }) {
  const url = new URL(oauth_google.endpoint);
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID!,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: oauth_google.scopes.join(" "),
  });

  // If you want to pass a custom redirect or other info, put it in 'state'
  if (redirect) {
    const encodedRedirect: Uint8Array = new TextEncoder().encode(redirect);
    params.set("state", encodeBase64url(encodedRedirect));
  }

  url.search = params.toString();
  return url.toString();
}

export function verifyGoogleCode(code: string, secret: string) {
  return safeFetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID!,
      client_secret: secret,
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
    }),
  })
    .andThen(safeZodParse(tokenResponseSchema))
    .andThen((result) => {
      if (!result.id_token) {
        return err({
          type: "auth" as const,
          message: "No ID token returned by Google",
        });
      }
      const [header, payload] = parseJWT(result.id_token);

      // Check the JOSE header for RS256
      const headerParameters = new JWSRegisteredHeaders(header);
      if (headerParameters.algorithm() !== joseAlgorithmRS256) {
        return err({ type: "auth" as const, message: "Unsupported algorithm" });
      }
      const claims = new JWTRegisteredClaims(payload);
      if (!claims.verifyExpiration()) {
        return err({ type: "auth" as const, message: "Expired token" });
      }
      if (claims.hasNotBefore() && !claims.verifyNotBefore()) {
        return err({ type: "auth" as const, message: "Invalid token" });
      }

      return ok(payload);
    })
    .andThen(safeZodParse(googleIdTokenPayloadSchema));
}
