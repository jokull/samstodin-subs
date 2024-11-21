"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function Pagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const searchParams = new URLSearchParams(useSearchParams());

  const createPageLink = (pageNumber: number) => {
    searchParams.set("page", pageNumber.toString());
    return `?${searchParams.toString()}`;
  };

  return (
    <div className="mt-4 flex justify-center space-x-2">
      {Array.from({ length: totalPages }, (_, index) => (
        <Link
          key={index + 1}
          href={createPageLink(index + 1)}
          className={`rounded border border-blue-500 px-3 py-1 ${
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
