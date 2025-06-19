import { and, desc, gte, lte } from "drizzle-orm";
import { getKennitalaBirthDate, parseKennitala } from "is-kennitala";
import Link from "next/link";

import { Pagination } from "~/components/Pagination";
import { askell } from "~/lib/api";
import { db } from "~/lib/db";
import { User } from "~/schema";

export default async function Page(props: {
  searchParams: Promise<Record<string, string>>;
}) {
  const searchParams = await props.searchParams;
  const page = searchParams.page ?? "1";
  const pageSize = 50;

  const { count, results } = await askell.get("/subscriptions/", {
    queries: {
      type: "full",
      page,
      page_size: pageSize.toString(),
      ordering: "-start_date",
    },
  });

  const subscriptions = results.flatMap(({ customer, ...sub }) =>
    customer && typeof customer === "object" ? [{ customer, ...sub }] : [],
  );

  // Use reduce to find the min and max dates
  const { minDate, maxDate } = subscriptions.reduce(
    (acc: { minDate: Date | null; maxDate: Date | null }, subscription) => {
      const { start_date } = subscription;

      if (start_date) {
        const startDate = new Date(start_date);

        if (!acc.minDate || startDate < acc.minDate) {
          acc.minDate = startDate;
        }
        if (!acc.maxDate || startDate > acc.maxDate) {
          acc.maxDate = startDate;
        }
      }
      return acc;
    },
    { minDate: null, maxDate: null },
  );

  const users = await db.query.User.findMany({
    where:
      minDate && maxDate
        ? and(
            gte(User.createdAt, minDate),
            lte(User.createdAt, page === "1" ? new Date() : maxDate),
          )
        : undefined,
    orderBy: desc(User.createdAt),
  });

  const subscriptionUsers = users.map((user) => {
    const subscription = subscriptions.find(
      ({ customer }) => customer.customer_reference === user.kennitala,
    );
    return { subscription, user };
  });

  return (
    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
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
            const billingLogs = subscription?.billing_logs ?? [];
            const settledTransactions = billingLogs.filter(
              ({ transaction }) => transaction?.state === "settled",
            );

            const createdAt = subscription?.start_date
              ? new Date(subscription.start_date)
              : user.createdAt;

            const kennitala = parseKennitala(user.kennitala);

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
                  {settledTransactions[0]?.transaction?.amount
                    ? settledTransactions[0]?.transaction.amount.split(".")[0] +
                      " kr."
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
                    <Link
                      target="_blank"
                      className="underline"
                      href={`https://askell.is/dashboard/customers/${subscription.customer.id}/`}
                    >
                      {subscription.cancelled
                        ? `${subscription.active ? "Rennur" : "Rann"} út ${subscription.active_until?.toLocaleDateString(
                            "is-IS",
                            {
                              year: "numeric",
                              month: "numeric",
                              day: "numeric",
                            },
                          )}`
                        : subscription.active
                          ? "Virk"
                          : "Óvirk"}
                    </Link>
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
        page={parseInt(page, 10)}
        totalPages={Math.ceil(count / pageSize)}
      />
    </div>
  );
}
