const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT,
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

export function normalizeEmail(value: string) {
  const email = value.toLowerCase().trim();
  const emailParts = email.split(/@/);

  if (emailParts.length !== 2) {
    throw new Error("Error not formatted");
  }

  let username = emailParts[0]!;
  const domain = emailParts[1]!;

  if (["gmail.com", "fastmail.com", "googlemail.com"].includes(domain)) {
    username = username.replace(".", "");
  }

  return username + "@" + domain;
}

export function formatCurrencyIcelandic(input: string): string {
  const numberValue = parseFloat(input);

  const formatter = new Intl.NumberFormat("is-IS", {
    style: "currency",
    currency: "ISK",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  });

  return formatter.format(numberValue).replace("kr.", "kr");
}

export function getApexDomain(hostname: string) {
  const domainParts = hostname.split(".");

  if (domainParts.length < 2) {
    return null;
  }

  return domainParts.slice(-2).join(".");
}
