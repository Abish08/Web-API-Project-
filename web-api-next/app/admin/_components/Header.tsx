"use client";

import { usePathname } from "next/navigation";
import { getUserData } from "@/lib/cookies";
import { useEffect, useState } from "react";
import { handleLogout } from "@/lib/actions/auth-action";

const TITLES: Record<string, string> = {
  admin: "Overview",
  users: "Users",
  create: "Create",
  edit: "Edit",
};

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

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
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-gray-500">
          {segments.join(" / ")}
        </p>
        <h1 className="text-lg font-bold leading-none text-gray-900">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-gray-600 sm:inline">
          {user?.username || user?.email || "Unknown user"}
        </span>
        <form action={handleLogout}>
          <button
            type="submit"
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900"
          >
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}