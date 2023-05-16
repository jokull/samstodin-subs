import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import crypto from "crypto";

const WEBHOOK_SECRET = process.env.ASKELL_WEBHOOKS_HMAC_SECRET ?? "";
const WEBHOOK_DIGEST_TYPE: crypto.BinaryToTextEncoding = "base64";

function verify(
  hmacHeader: string,
  digestMethod: string,
  secret: string,
  message: string
): boolean {
  const digest = crypto
    .createHmac(digestMethod, secret)
    .update(message, "utf8")
    .digest(WEBHOOK_DIGEST_TYPE);

  return digest === hmacHeader;
}

export const meta: MetaFunction = () => {
  return { status: "200" };
};

export const loader: LoaderFunction = async ({ request }) => {
  const contentType = request.headers.get("content-type") || "";
  const hmacHeader = request.headers.get("X-Hook-Hmac");

  if (!contentType.startsWith("application/json") || !hmacHeader) {
    return json(
      {
        message: "Invalid request",
      },
      { status: 400 }
    );
  }

  const rawBody = await request.text();

  if (!verify(hmacHeader, "sha512", WEBHOOK_SECRET, rawBody)) {
    return json(
      {
        message: "Invalid webhook signature",
      },
      { status: 401 }
    );
  }

  const data = JSON.parse(rawBody);
  console.log("Received webhook:", data);

  return json({ message: "Webhook received" });
};
