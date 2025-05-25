import { and, countDistinct, desc, gte, lte } from "drizzle-orm";
import { getKennitalaBirthDate, parseKennitala } from "is-kennitala";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Header } from "~/components/Header";
import { Pagination } from "~/components/Pagination";
import { askell } from "~/lib/api";
import { db } from "~/lib/db";
import { getSession } from "~/lib/session";
import { User } from "~/schema";

export default async function Page({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const user = await getSession(cookies().get("__session")?.value ?? "");
  if (!user || !user.isAdmin) {
    redirect("/askrift");
  }

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

  console.log(
    `Found ${subscriptions.length} subscriptions between ${minDate?.toLocaleDateString(
      "is-IS",
    )} and ${maxDate?.toLocaleDateString("is-IS")}`,
  );

  const totalUsers = await db.select({count: countDistinct(User.id)}).from(User)
  console.log(`Total users in database: ${totalUsers.join(', ')}`);

  const users = await db.query.User.findMany({
    where:
      minDate && maxDate
        ? and(gte(User.createdAt, minDate), lte(User.createdAt, page === "1" ? new Date() : maxDate))
        : undefined,
    orderBy: desc(User.createdAt),
  });

  console.log(
    `Fetched ${users.length} users between ${minDate?.toLocaleDateString(
      "is-IS",
    )} and ${maxDate?.toLocaleDateString("is-IS")}`,
  );

  const subscriptionUsers = users.map((user) => {
    const subscription = subscriptions.find(
      ({ customer }) => customer.customer_reference === user.kennitala,
    );
    return { subscription, user };
  });

  return (
    <div className="mx-auto flex h-full min-h-screen flex-col px-4 sm:px-6 lg:px-8">
      <Header user={user} />

      <div className="">
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
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
                      className="relative py-3.5 pl-3 pr-4 text-left text-sm font-semibold text-gray-900 sm:pr-0"
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
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          {user.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {kennitala?.formatted ?? user.kennitala}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm tabular-nums text-gray-500">
                          {kennitala
                            ? getKennitalaBirthDate(
                                kennitala.value,
                              )?.getUTCFullYear()
                            : undefined}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {settledTransactions[0]?.transaction?.amount
                            ? settledTransactions[0]?.transaction.amount.split(
                                ".",
                              )[0] + " kr."
                            : null}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {createdAt.toLocaleDateString("is-IS")}
                        </td>
                        <td
                          className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 underline ${
                            subscription?.active ? "" : "text-red-600"
                          }`}
                        >
                          {subscription ? (
                            <Link
                              target="_blank"
                              href={`https://askell.is/dashboard/customers/${subscription.customer.id}/`}
                            >
                              {subscription.active ? "Virk" : "Óvirk"}
                            </Link>
                          ) : (
                            <span>Óskráður</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
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
          </div>
        </div>
      </div>
    </div>
  );
}
