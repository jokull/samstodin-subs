import { promisify } from "node:util";
import { gunzip, gzip } from "node:zlib";

import { and, count as countRows, desc, gte, lte } from "drizzle-orm";
import { getKennitalaBirthDate, parseKennitala } from "is-kennitala";
import { unstable_cache } from "next/cache";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Pagination } from "~/components/Pagination";
import { env } from "~/env";
import {
  getAllSubscriptionContracts,
  getContractAmount,
  getContractStatus,
  subscriptionContractSchema,
} from "~/lib/askell-v2";
import { db } from "~/lib/db";
import { getSession } from "~/lib/session";
import { User } from "~/schema";

/**
 * Loading the full contract list from Áskell takes several seconds, which
 * leaves too little headroom under Vercel's default function time limit.
 */
export const maxDuration = 60;

/** How long to wait for Áskell's contract list before falling back. */
const CONTRACTS_TIMEOUT_MS = 40_000;

/** Length of each window in which one cached contract list is shared. */
const CONTRACTS_CACHE_SECONDS = 5 * 60;

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

type UnknownRecord = Record<string, unknown>;

type AdminSubscription = {
  active: boolean;
  activeUntil: Date | null;
  /** Recurring amount in ISK, when known. */
  amount: number | null;
  cancelled: boolean;
  customerId: number | string | null;
  customerReference: string | null;
  startDate: Date | null;
};

type ParsedSubscription = {
  subscription: AdminSubscription;
  warnings: string[];
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toDate(value: unknown) {
  if (value instanceof Date) {
    return Number.isNaN(value.valueOf()) ? null : value;
  }

  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date;
}

function toString(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return null;
}

function describeValue(value: unknown) {
  if (value === undefined) {
    return "undefined";
  }

  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    return "array";
  }

  if (value instanceof Date) {
    return "date";
  }

  return typeof value;
}

function parseSubscription(value: unknown) {
  if (!isRecord(value)) {
    return null;
  }

  const customer = isRecord(value.customer) ? value.customer : null;
  const settledAmount = Array.isArray(value.billing_logs)
    ? value.billing_logs.reduce<number | null>((found, entry) => {
        if (found !== null || !isRecord(entry)) {
          return found;
        }
        const transaction = isRecord(entry.transaction)
          ? entry.transaction
          : null;
        if (!transaction || toString(transaction.state) !== "settled") {
          return found;
        }
        const amount = Number(toString(transaction.amount));
        return Number.isNaN(amount) ? found : amount;
      }, null)
    : null;

  const subscription = {
    active: value.active === true,
    activeUntil: toDate(value.active_until),
    amount: settledAmount,
    cancelled: value.cancelled === true,
    customerId:
      customer &&
      (typeof customer.id === "number" || typeof customer.id === "string")
        ? customer.id
        : null,
    customerReference: customer ? toString(customer.customer_reference) : null,
    startDate: toDate(value.start_date),
  } satisfies AdminSubscription;

  const warnings = [
    !customer ? "customer missing or invalid" : null,
    subscription.customerReference === null
      ? "customer_reference missing or invalid"
      : null,
    typeof value.active !== "boolean"
      ? `active normalized from ${describeValue(value.active)}`
      : null,
    typeof value.cancelled !== "boolean"
      ? `cancelled normalized from ${describeValue(value.cancelled)}`
      : null,
    value.start_date === undefined
      ? "start_date missing"
      : subscription.startDate === null
        ? `start_date normalized from ${describeValue(value.start_date)}`
        : null,
  ].filter((warning) => warning !== null);

  return {
    subscription,
    warnings,
  } satisfies ParsedSubscription;
}

function toIsoString(date: Date | null) {
  return date?.toISOString() ?? null;
}

/**
 * Every v2 subscription contract, shared across requests within one cache
 * window so that page loads and pagination do not each wait on Áskell for the
 * full list.
 *
 * `slot` numbers the window and is part of the cache key, so the first request
 * in a new window fetches a fresh list. Entries outlive their window, so Next
 * never serves one stale while revalidating in the background, which would
 * show data of any age to the first visitor after a quiet period.
 *
 * Only the fields the table reads are kept, with dates as ISO strings. The
 * JSON is gzipped and base64-encoded so full lists fit the cache's 2 MB item
 * limit. Callers decompress it and parse through `subscriptionContractSchema`.
 */
const getCachedContracts = unstable_cache(
  // `slot` is only read by unstable_cache, as part of the cache key.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (slot: number) => {
    const contracts = await getAllSubscriptionContracts({
      signal: AbortSignal.timeout(CONTRACTS_TIMEOUT_MS),
    });

    const compactContracts = contracts.map((contract) => ({
      billing_anchor_at: toIsoString(contract.billing_anchor_at),
      cancel_at: toIsoString(contract.cancel_at),
      cancel_at_period_end: contract.cancel_at_period_end,
      canceled_at: toIsoString(contract.canceled_at),
      created_at: toIsoString(contract.created_at),
      customer_id: contract.customer_id,
      customer_reference: contract.customer_reference,
      ended_at: toIsoString(contract.ended_at),
      id: contract.id,
      items: contract.items?.map((item) => ({
        price: item.price ? { unit_amount: item.price.unit_amount } : null,
        quantity: item.quantity,
        unit_amount_override: item.unit_amount_override,
      })),
      next_billing_at: toIsoString(contract.next_billing_at),
      state: contract.state,
    }));

    return (await gzipAsync(JSON.stringify(compactContracts))).toString(
      "base64",
    );
  },
  ["admin-subscription-contracts-gzip-v1"],
  { revalidate: CONTRACTS_CACHE_SECONDS * 2 },
);

/**
 * Reads every v2 subscription contract and maps it onto the admin table shape.
 *
 * The v2 list endpoint documents no ordering parameter, so all contracts are
 * pulled and sorted here. Status is derived on each request, so a contract
 * that lapses while the list is cached still shows as ended.
 */
async function getContractSubscriptions() {
  const slot = Math.floor(Date.now() / (CONTRACTS_CACHE_SECONDS * 1000));
  const cached = await getCachedContracts(slot);
  const json = await gunzipAsync(Buffer.from(cached, "base64"));
  const contracts = subscriptionContractSchema
    .array()
    .parse(JSON.parse(json.toString("utf8")) as unknown);
  const now = new Date();

  const subscriptions = contracts.map((contract) => {
    const { endsAt, isActive, isCancelled } = getContractStatus(contract, now);

    return {
      active: isActive,
      activeUntil: endsAt,
      amount: getContractAmount(contract),
      cancelled: isCancelled,
      customerId: contract.customer_id ?? null,
      customerReference: contract.customer_reference ?? null,
      startDate: contract.billing_anchor_at ?? contract.created_at,
    } satisfies AdminSubscription;
  });

  subscriptions.sort(
    (a, b) => (b.startDate?.valueOf() ?? 0) - (a.startDate?.valueOf() ?? 0),
  );

  return subscriptions;
}

async function getLegacyAdminSubscriptions(page: string, pageSize: number) {
  const searchParams = new URLSearchParams({
    ordering: "-start_date",
    page,
    page_size: pageSize.toString(),
    type: "full",
  });

  try {
    const response = await fetch(
      `https://askell.is/api/subscriptions/?${searchParams.toString()}`,
      {
        cache: "no-store",
        headers: { Authorization: `Api-Key ${env.ASKELL_PRIVATE}` },
      },
    );

    if (!response.ok) {
      const body = (await response.text()).slice(0, 500);
      console.error("[admin] Askell subscriptions request failed", {
        body,
        page,
        status: response.status,
        statusText: response.statusText,
      });

      return {
        count: 0,
        error: "Ekki tókst að sækja áskriftargögn frá Áskeli.",
        subscriptions: [],
      };
    }

    const payload = (await response.json()) as unknown;
    if (!isRecord(payload) || !Array.isArray(payload.results)) {
      console.error("[admin] Unexpected Askell subscriptions payload", {
        keys: isRecord(payload) ? Object.keys(payload) : [],
        page,
      });

      return {
        count: 0,
        error: "Áskriftargögn frá Áskeli komu á óvæntu formi.",
        subscriptions: [],
      };
    }

    let invalidResults = 0;
    const subscriptions = payload.results.flatMap((entry, index) => {
      const parsed = parseSubscription(entry);
      if (parsed) {
        if (parsed.warnings.length > 0) {
          console.warn("[admin] Askell subscription record normalized", {
            index,
            issues: parsed.warnings,
            keys: isRecord(entry) ? Object.keys(entry) : [],
            page,
          });
        }

        return [parsed.subscription];
      }

      invalidResults += 1;
      console.error("[admin] Dropping invalid Askell subscription record", {
        index,
        keys: isRecord(entry) ? Object.keys(entry) : [],
        page,
      });
      return [];
    });

    if (invalidResults > 0) {
      console.error("[admin] Askell subscriptions contained invalid records", {
        invalidResults,
        page,
        returnedResults: payload.results.length,
      });
    }

    return {
      count: typeof payload.count === "number" ? payload.count : 0,
      error: null,
      subscriptions,
    };
  } catch (error) {
    console.error("[admin] Failed to load Askell subscriptions", {
      error,
      page,
    });

    return {
      count: 0,
      error: "Ekki tókst að sækja áskriftargögn frá Áskeli.",
      subscriptions: [],
    };
  }
}

/**
 * Subscription data for the admin table.
 *
 * Samstöðin was migrated to v2 subscription contracts, so contracts are the
 * source of truth. The legacy subscriptions list is used only if the v2
 * request fails or returns nothing.
 */
async function getAdminSubscriptions(page: string, pageSize: number) {
  let contractsFailed = false;

  try {
    const subscriptions = await getContractSubscriptions();
    if (subscriptions.length > 0) {
      return {
        count: subscriptions.length,
        error: null,
        source: "contract" as const,
        subscriptions,
      };
    }
  } catch (error) {
    contractsFailed = true;
    console.error("[admin] Failed to load Askell v2 contracts", { error });
  }

  const legacy = await getLegacyAdminSubscriptions(page, pageSize);

  return {
    ...legacy,
    // Legacy records stopped updating after the v2 migration, so say so
    // rather than silently showing statuses that may be out of date.
    error:
      legacy.error ??
      (contractsFailed
        ? "Ekki tókst að sækja nýjustu áskriftargögnin frá Áskeli, svo staðan hér gæti verið úrelt."
        : null),
    source: "legacy" as const,
  };
}

export default async function Page(props: {
  searchParams: Promise<Record<string, string>>;
}) {
  // The layout checks this too, but Next renders the layout and page in
  // parallel, so without it every logged-out request would still pull the
  // full contract list from Áskell before being redirected.
  const user = await getSession(
    (await cookies()).get("__session")?.value ?? "",
  );
  if (!user?.isAdmin) {
    redirect(`/login?redirect=${encodeURIComponent("/admin")}`);
  }

  const searchParams = await props.searchParams;
  const page = searchParams.page ?? "1";
  const parsedPage = Number.parseInt(page, 10);
  const pageNumber =
    Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const pageSize = 50;

  const { count, error, source, subscriptions } = await getAdminSubscriptions(
    page,
    pageSize,
  );

  const { minDate, maxDate } = subscriptions.reduce(
    (acc: { minDate: Date | null; maxDate: Date | null }, subscription) => {
      if (subscription.startDate) {
        if (!acc.minDate || subscription.startDate < acc.minDate) {
          acc.minDate = subscription.startDate;
        }
        if (!acc.maxDate || subscription.startDate > acc.maxDate) {
          acc.maxDate = subscription.startDate;
        }
      }
      return acc;
    },
    { minDate: null, maxDate: null },
  );

  const useUnfilteredUsers = source === "contract" || !minDate || !maxDate;
  const [users, totalCount] = useUnfilteredUsers
    ? await Promise.all([
        db.query.User.findMany({
          limit: pageSize,
          offset: (pageNumber - 1) * pageSize,
          orderBy: desc(User.createdAt),
        }),
        db
          .select({ count: countRows() })
          .from(User)
          .then((rows) => rows[0]!.count),
      ])
    : await Promise.all([
        db.query.User.findMany({
          where: and(
            gte(User.createdAt, minDate),
            lte(User.createdAt, pageNumber === 1 ? new Date() : maxDate),
          ),
          orderBy: desc(User.createdAt),
        }),
        Promise.resolve(count),
      ]);

  const subscriptionUsers = users.map((user) => {
    const subscription = subscriptions.find(
      ({ customerReference }) => customerReference === user.kennitala,
    );
    return { subscription, user };
  });

  return (
    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
      {error ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}
      <table className="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th
              scope="col"
              className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-0"
            >
              Nafn
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Kennitala
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Email
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Aldur
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Áskrift
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Byrjaði
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Staða
            </th>
            <th
              scope="col"
              className="relative py-3.5 pr-4 pl-3 text-left text-sm font-semibold text-gray-900 sm:pr-0"
            >
              Alþýðufélag
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {subscriptionUsers?.map(({ user, subscription }) => {
            const createdAt = subscription?.startDate ?? user.createdAt;

            const kennitala = parseKennitala(user.kennitala);
            const status =
              subscription?.cancelled && subscription.activeUntil
                ? `${subscription.active ? "Rennur" : "Rann"} út ${subscription.activeUntil.toLocaleDateString(
                    "is-IS",
                    {
                      day: "numeric",
                      month: "numeric",
                      year: "numeric",
                    },
                  )}`
                : subscription?.cancelled
                  ? subscription.active
                    ? "Rennur út"
                    : "Rann út"
                  : subscription?.active
                    ? "Virk"
                    : "Óvirk";

            return (
              <tr key={user.id}>
                <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-0">
                  {user.name}
                </td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                  {kennitala?.formatted ?? user.kennitala}
                </td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                  {user.email}
                </td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 tabular-nums">
                  {kennitala
                    ? getKennitalaBirthDate(kennitala.value)?.getUTCFullYear()
                    : undefined}
                </td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                  {subscription?.amount != null
                    ? `${subscription.amount.toLocaleString("is-IS", {
                        maximumFractionDigits: 0,
                      })} kr.`
                    : null}
                </td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                  {createdAt.toLocaleDateString("is-IS")}
                </td>
                <td
                  className={`px-3 py-4 text-sm whitespace-nowrap text-gray-500 ${
                    subscription?.active ? "" : "text-red-600"
                  }`}
                >
                  {subscription ? (
                    subscription.customerId ? (
                      <Link
                        target="_blank"
                        className="underline"
                        href={`https://askell.is/dashboard/customers/${subscription.customerId}/`}
                      >
                        {status}
                      </Link>
                    ) : (
                      <span>{status}</span>
                    )
                  ) : (
                    <span>Óskráður</span>
                  )}
                </td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                  {user?.althydufelagid ? "✓" : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Pagination
        page={pageNumber}
        totalPages={Math.ceil(totalCount / pageSize)}
      />
    </div>
  );
}
