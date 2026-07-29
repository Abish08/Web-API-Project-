"use client";

import { usePathname } from "next/navigation";
import { getUserData } from "@/lib/cookies";
import Link from "next/link";
import { useEffect, useState } from "react";
import { handleLogout } from "@/lib/actions/auth-action";
import { User } from "@/lib/api/types";

const TITLES: Record<string, string> = {
  admin: "Overview",
  users: "Users",
  create: "Create",
  edit: "Edit",
};

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUserData();
      setUser(userData);
    };
    fetchUser();
  }, []);

  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1] ?? "admin";
  const title = TITLES[last] ?? last;

  return (
    <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between gap-4 border-b border-green-100 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6 lg:px-8">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-800">
          Admin Console {segments.length ? `/ ${segments.join(" / ")}` : ""}
        </p>
        <h1 className="mt-1 text-xl font-black capitalize text-slate-950">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/admin" className="nn-focus-ring rounded-full bg-green-100 px-3 py-2 text-sm font-bold text-green-950 lg:hidden">
          Admin
        </Link>
        <span className="hidden max-w-48 truncate text-sm font-bold text-green-950 sm:inline">
          {user?.username || user?.email || "Unknown user"}
        </span>
        <form action={handleLogout}>
          <button
            type="submit"
            className="nn-focus-ring rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-orange-600"
          >
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}
