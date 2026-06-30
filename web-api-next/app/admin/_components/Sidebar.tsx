"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/users", label: "Users" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
      <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-6">
        <div className="h-5 w-1 rounded-full bg-green-500" />
        <span className="text-sm font-bold uppercase tracking-[1.5px] text-gray-900">
          Admin Panel
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4" aria-label="Admin sections">
        {NAV.map(({ href, label, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <Link
          href="/dashboard"
          className="text-xs font-medium tracking-[0.5px] text-gray-600 transition-colors hover:text-gray-900"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </aside>
  );
}