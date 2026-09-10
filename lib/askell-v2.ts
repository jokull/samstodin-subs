import { z } from "zod";

import { env } from "~/env";

/**
 * Client for Áskell's Subscription Contracts V2 API.
 * Docs: https://docs.askell.is/api/subscription_contracts_v2.html
 *
 * The generated Zodios client in `lib/askell.ts` only covers the legacy
 * `/api/` endpoints, so the v2 endpoints are called directly here.
 *
 * The schemas below follow the live payload, which carries considerably more
 * than the documented example. Notably the documented `active_from` and
 * `active_until` fields do not exist. Cancellation is expressed through
 * `cancel_at_period_end`, `cancel_at`, `canceled_at` and `ended_at` instead.
 */

const ASKELL_V2_BASE_URL = "https://askell.is/api/v2";

const nullableDate = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (!value) {
      return null;
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  });

export type ContractState = "active" | "cancelled" | "paused" | "inactive";

/**
 * Maps Áskell's contract state onto the four states this app cares about.
 *
 * The value is parsed as a free-form string rather than an enum so that an
 * unfamiliar state cannot fail the whole list parse and knock every subscriber
 * back to the legacy API. Both spellings of "cancelled" are accepted, since
 * the payload itself mixes them (`canceled_at`).
 */
export function normalizeContractState(state: string): ContractState {
  const value = state.trim().toLowerCase();
  if (value.startsWith("cancel")) {
    return "cancelled";
  }
  if (value.startsWith("pause")) {
    return "paused";
  }
  if (value === "active") {
    return "active";
  }
  return "inactive";
}

const priceSchema = z
  .object({
    currency: z.string().nullish(),
    product_name: z.string().nullish(),
    unit_amount: z.string().nullish(),
  })
  .passthrough();

const contractItemSchema = z
  .object({
    id: z.number().int().nullish(),
    price: priceSchema.nullish(),
    quantity: z.number().nullish(),
    unit_amount_override: z.string().nullish(),
  })
  .passthrough();

const latestBillingRunSchema = z
  .object({
    id: z.number().int().nullish(),
    state: z.string().nullish(),
    run_type: z.string().nullish(),
    total_amount: z.string().nullish(),
    period_start_at: nullableDate,
    period_end_at: nullableDate,
  })
  .passthrough();

export const subscriptionContractSchema = z
  .object({
    id: z.number().int(),
    customer_id: z.number().int().nullish(),
    customer_reference: z.string().nullish(),
    currency: z.string().nullish(),
    state: z.string(),
    service_state: z.string().nullish(),
    service_active: z.boolean().nullish(),
    legacy_subscription_ids: z.array(z.number().int()).nullish(),
    billing_anchor_at: nullableDate,
    next_billing_at: nullableDate,
    cancel_at_period_end: z.boolean().nullish(),
    cancel_at: nullableDate,
    canceled_at: nullableDate,
    ended_at: nullableDate,
    paused_until: nullableDate,
    subscriber_page: z.string().nullish(),
    items: z.array(contractItemSchema).nullish(),
    latest_billing_run: latestBillingRunSchema.nullish(),
    metadata: z.record(z.unknown()).nullish(),
    created_at: nullableDate,
    updated_at: nullableDate,
  })
  .passthrough();

export type SubscriptionContract = z.infer<typeof subscriptionContractSchema>;

/**
 * Derives access status from a contract.
 *
 * `state` is the billing authority here, not `service_active`. Almost every
 * migrated Samstöðin contract sits at `state: "active"` with
 * `service_active: false`, because service items track fulfilment rather than
 * whether the customer is paying.
 */
export function getContractStatus(
  contract: SubscriptionContract,
  now = new Date(),
) {
  const state = normalizeContractState(contract.state);

  // The date access actually stops. A contract cancelled at period end carries
  // no explicit end date, so the next billing date is when it lapses. The
  // trailing `?? null` collapses an absent field onto null, so this stays
  // correct for any contract-shaped object, not only Zod-parsed ones.
  const endsAt =
    contract.ended_at ??
    contract.cancel_at ??
    (contract.cancel_at_period_end === true
      ? contract.next_billing_at
      : null) ??
    null;

  const hasEnded = endsAt !== null && endsAt <= now;

  const isCancelled =
    state === "cancelled" ||
    contract.cancel_at_period_end === true ||
    Boolean(contract.cancel_at) ||
    Boolean(contract.canceled_at) ||
    Boolean(contract.ended_at);

  const isActive =
    state === "active" || state === "cancelled" ? !hasEnded : false;

  return {
    endsAt,
    hasEnded,
    isActive,
    isCancelled,
    isPaused: state === "paused" || Boolean(contract.paused_until),
    state,
  };
}

const ASKELL_HOST = "askell.is";

/**
 * The customer-facing page where a subscriber manages this contract, used for
 * changing payment method.
 *
 * Áskell returns it as a full URL (`subscriber_page`). It is checked here
 * because the value ends up in an `href`, and only https links on Áskell's own
 * host are accepted.
 */
export function getContractManagementUrl(contract: SubscriptionContract) {
  const raw = contract.subscriber_page;
  if (!raw) {
    return null;
  }

  let url;
  try {
    url = new URL(raw);
  } catch {
    console.warn("[askell-v2] Contract subscriber_page is not a URL", {
      contractId: contract.id,
    });
    return null;
  }

  if (url.protocol !== "https:" || url.hostname !== ASKELL_HOST) {
    console.warn("[askell-v2] Ignoring unexpected subscriber_page target", {
      contractId: contract.id,
      hostname: url.hostname,
      protocol: url.protocol,
    });
    return null;
  }

  return url.toString();
}

/**
 * The recurring amount the customer pays, in major units.
 *
 * Taken from the contract's items, which every contract has, rather than from
 * billing runs, which most contracts do not have yet.
 */
export function getContractAmount(contract: SubscriptionContract) {
  const items = contract.items ?? [];
  if (items.length === 0) {
    return null;
  }

  let total = 0;
  for (const item of items) {
    const raw = item.unit_amount_override ?? item.price?.unit_amount;
    const unit = raw === null || raw === undefined ? NaN : Number(raw);
    if (Number.isNaN(unit)) {
      return null;
    }
    total += unit * (item.quantity ?? 1);
  }

  return total;
}

const contractListSchema = z.union([
  z.array(subscriptionContractSchema),
  z
    .object({
      next: z.string().nullish(),
      results: z.array(subscriptionContractSchema),
    })
    .passthrough(),
]);

export class AskellV2Error extends Error {
  readonly status: number;
  readonly body: string;

  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = "AskellV2Error";
    this.status = status;
    this.body = body;
  }
}

async function askellV2Fetch(path: string, init?: RequestInit) {
  const response = await fetch(`${ASKELL_V2_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      Authorization: `Api-Key ${env.ASKELL_PRIVATE}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.text()).slice(0, 500);
    throw new AskellV2Error(
      `Askell v2 request failed: ${init?.method ?? "GET"} ${path} -> ${response.status}`,
      response.status,
      body,
    );
  }

  return (await response.json()) as unknown;
}

/**
 * Lists every v2 subscription contract that belongs to the given customer
 * reference (Samstöðin uses the kennitala as the customer reference).
 */
export async function getSubscriptionContracts(customerReference: string) {
  const searchParams = new URLSearchParams({
    customer_reference: customerReference,
  });
  const payload = await askellV2Fetch(
    `/subscription-contracts/?${searchParams.toString()}`,
  );
  const parsed = contractListSchema.parse(payload);
  return Array.isArray(parsed) ? parsed : parsed.results;
}

const CONTRACT_PAGE_SIZE = 1000;

/**
 * Fetches every subscription contract, following pagination.
 *
 * The v2 list endpoint documents no ordering parameter, so callers that need
 * a specific order have to sort the result themselves.
 */
export async function getAllSubscriptionContracts(maxPages = 20) {
  const contracts: SubscriptionContract[] = [];

  for (let page = 1; page <= maxPages; page++) {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      page_size: CONTRACT_PAGE_SIZE.toString(),
    });
    const payload = await askellV2Fetch(
      `/subscription-contracts/?${searchParams.toString()}`,
    );
    const parsed = contractListSchema.parse(payload);
    const results = Array.isArray(parsed) ? parsed : parsed.results;
    contracts.push(...results);

    const hasNextPage =
      !Array.isArray(parsed) && typeof parsed.next === "string";
    if (results.length < CONTRACT_PAGE_SIZE && !hasNextPage) {
      break;
    }
  }

  return contracts;
}

/**
 * Cancels a v2 contract at the end of the current billing period, so the
 * customer keeps access for the time they have already paid for.
 */
export async function cancelSubscriptionContract(contractId: number) {
  const payload = await askellV2Fetch(
    `/subscription-contracts/${contractId}/cancel/`,
    {
      method: "POST",
      body: JSON.stringify({ cancel_at_period_end: true }),
    },
  );
  return subscriptionContractSchema.parse(payload);
}
