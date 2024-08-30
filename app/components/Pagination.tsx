import { Link, useSearchParams } from "@remix-run/react";

function Pagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const [searchParams] = useSearchParams();

  const createPageLink = (pageNumber: number) => {
    searchParams.set("page", pageNumber.toString());
    return `?${searchParams.toString()}`;
  };

  return (
    <div className="flex justify-center mt-4 space-x-2">
      {Array.from({ length: totalPages }, (_, index) => (
        <Link
          key={index + 1}
          to={createPageLink(index + 1)}
          className={`px-3 py-1 border rounded border-blue-500 ${
            page === index + 1
              ? "bg-blue-500 text-white"
              : "bg-white text-blue-500 "
          }`}
        >
          {index + 1}
        </Link>
      ))}
    </div>
  );
}

export default Pagination;
