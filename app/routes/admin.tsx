import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getApi } from "~/api";
import { Header } from "~/components/Header";
import Pagination from "~/components/Pagination";
import { prisma } from "~/db.server";

import { getUser } from "~/session.server";
import { calculateAgeFromKennitala, useUser } from "~/utils";

export const meta: V2_MetaFunction = () => [{ title: "Áskriftir - Samstöðin" }];

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUser(request);
  if (!user || !user.isAdmin) {
    return redirect("/askrift");
  }

  const url = new URL(request.url);
  const page = url.searchParams.get("page") || "1";
  const pageSize = 50;

  const askell = getApi();

  const { count, results } = await askell.get("/subscriptions/", {
    queries: {
      type: "full",
      page,
      page_size: pageSize.toString(),
      ordering: "-start_date",
    },
  });
  const users = await prisma.user.findMany({
    orderBy: [{ createdAt: "desc" }],
  });

  return json({
    page: parseInt(page, 10),
    totalPages: Math.ceil(count / pageSize),
    subscriptionUsers: results
      .flatMap(({ customer, ...sub }) =>
        customer && typeof customer === "object" ? [{ customer, ...sub }] : []
      )
      .map((subscription) => ({
        subscription,
        user:
          users.find((user) => {
            const customer = subscription.customer;
            const kennitala = customer.customer_reference;
            if (kennitala === user.kennitala) {
              return user;
            }
            return undefined;
          }) ?? null,
      })),
  });
};

export default function AskriftirPage() {
  const data = useLoaderData<typeof loader>();
  const user = useUser();

  return (
    <div className="flex h-full min-h-screen px-4 sm:px-6 lg:px-8 mx-auto flex-col">
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
                      className="relative py-3.5 pl-3 pr-4 sm:pr-0 text-left text-sm font-semibold text-gray-900"
                    >
                      Alþýðufélag
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.subscriptionUsers?.map(({ user, subscription }) => {
                    const billingLogs = subscription?.billing_logs ?? [];
                    const settledTransactions = billingLogs.filter(
                      ({ transaction }) => transaction?.state === "settled"
                    );

                    return (
                      <tr key={subscription.customer.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          {subscription.customer.first_name}{" "}
                          {subscription.customer.last_name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {subscription.customer.customer_reference}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {subscription.customer.email}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {calculateAgeFromKennitala(
                            subscription.customer.customer_reference
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {settledTransactions[0]?.transaction?.amount
                            ? settledTransactions[0]?.transaction.amount.split(
                                "."
                              )[0] + " kr."
                            : null}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {subscription?.start_date?.slice(0, 10)}
                        </td>
                        <td
                          className={`whitespace-nowrap px-3 py-4 text-sm underline text-gray-500 ${
                            subscription.active ? "" : "text-red-600"
                          }`}
                        >
                          <Link
                            target="_blank"
                            to={`https://askell.is/dashboard/customers/${subscription.customer.id}/`}
                          >
                            {subscription.active ? "Virk" : "Óvirk"}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {user?.althydufelagid ? "✓" : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <Pagination page={data.page} totalPages={data.totalPages} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
