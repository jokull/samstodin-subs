import { count, desc, notInArray } from "drizzle-orm";

import { Pagination } from "~/components/Pagination";
import { db } from "~/lib/db";
import { Email, User } from "~/schema";

export default async function Page(props: {
  searchParams: Promise<Record<string, string>>;
}) {
  const searchParams = await props.searchParams;
  const page = searchParams.page ?? "1";
  const pageSize = 50;

  // Drizzle query to find Emails that are not in Users
  const baseQuery = db
    .select({
      email: Email.email,
      createdAt: Email.createdAt,
      source: Email.source,
    })
    .from(Email)
    .where(
      notInArray(
        Email.email,
        db.selectDistinct({ userEmail: User.email }).from(User),
      ),
    );

  const total = await db
    .select({ count: count() })
    .from(baseQuery.as("countQuery"))
    .then((rows) => rows[0]!.count);

  const results = await baseQuery
    .offset((parseInt(page, 10) - 1) * pageSize)
    .limit(pageSize)
    .orderBy(desc(Email.createdAt));

  return (
    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
      <table className="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th
              scope="col"
              className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-0"
            >
              Netfang
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Skráningardagur
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Skráningarleið
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {results?.map(({ createdAt, email, source }) => {
            return (
              <tr key={email}>
                <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-0">
                  {email}
                </td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                  {createdAt.toLocaleDateString("is-IS")}
                </td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                  {source ?? "Óþekkt"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Pagination
        page={parseInt(page, 10)}
        totalPages={Math.ceil(total / pageSize)}
      />
    </div>
  );
}
