"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLinkStatus } from "next/link";

function LoadingIndicator() {
  const { pending } = useLinkStatus();
  return pending ? (
    <span className="inline-block w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin ml-1" />
  ) : null;
}

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav>
      <ul className="flex space-x-6">
        <li>
          <Link
            href="/admin"
            className={pathname === "/admin" ? "underline" : ""}
          >
            Skráningar <LoadingIndicator />
          </Link>
        </li>
        <li>
          <Link
            href="/admin/emails"
            className={pathname === "/admin/emails" ? "underline" : ""}
          >
            Netföng <LoadingIndicator />
          </Link>
        </li>
      </ul>
    </nav>
  );
}
