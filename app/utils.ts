import { useMatches } from "@remix-run/react";
import { useMemo } from "react";

import type { User } from "~/models/user.server";

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
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );
  return route?.data;
}

function isUser(user: any): user is User {
  return user && typeof user === "object" && typeof user.email === "string";
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead."
    );
  }
  return maybeUser;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

export function normalizeEmail(value: string) {
  const email = value.toLowerCase().trim();
  const emailParts = email.split(/@/);

  if (emailParts.length !== 2) {
    return email;
  }

  let username = emailParts[0] as string;
  const domain = emailParts[1] as string;

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

export function calculateAgeFromKennitala(kennitala: string) {
  // Verify that the kennitala length is correct
  if (kennitala.length !== 10) {
    return null;
  }

  // Extract day, month, and year from the kennitala
  let day = kennitala.slice(0, 2);
  let month = kennitala.slice(2, 4);
  let year = kennitala.slice(4, 6);

  // Handle century: assume that '21' is prepended if birth year is less than current year, '20' otherwise
  const currentYear = new Date().getFullYear() % 100;
  let century = parseInt(year) <= currentYear ? "20" : "19";
  year = century + year;

  // Construct a Date object from the extracted values
  let birthDate = new Date(`${year}-${month}-${day}`);

  // Verify that the birth date is a valid date
  if (isNaN(birthDate.getTime())) {
    return null;
  }

  // Calculate the age based on the current date
  let today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  let m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}
