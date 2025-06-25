"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";

function LoadingIndicator() {
  const { pending } = useLinkStatus();
  return pending ? (
    <span className="ml-1 inline-block h-3 w-3 animate-spin rounded-full border border-gray-400 border-t-transparent" />
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
        <li>
          <Link
            href="/admin/settings"
            className={pathname === "/admin/settings" ? "underline" : ""}
          >
            Stillingar <LoadingIndicator />
          </Link>
        </li>
      </ul>
    </nav>
  );
}
