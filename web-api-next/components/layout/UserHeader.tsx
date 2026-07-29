"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { handleLogout } from "@/lib/actions/auth-action";
import { AICoachDrawer } from "./AICoachDrawer";
import Image from "next/image";

type StoredUser = {
  username?: string;
  email?: string;
  role?: string;
};

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home" },
  { href: "/meals", label: "Meals" },
  { href: "/weekly-plan", label: "Weekly Plan" },
  { href: "/workout", label: "Workout" },
  { href: "/log", label: "Log" },
  { href: "/progress", label: "Progress" },
  { href: "/profile", label: "Profile" },
];

function readStoredUser(): StoredUser | null {
  if (typeof document === "undefined") return null;

  const cookieValue = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("user_data="));

  if (!cookieValue) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(cookieValue.split("=")[1])) as StoredUser;
  } catch {
    return null;
  }
}

export function UserHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setUser(readStoredUser()), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const isAuthenticated = Boolean(user);
  const userLabel = user?.username || user?.email || "Account";

  const navLinks = NAV_ITEMS.map((item) => {
    const isActive =
      pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setIsOpen(false)}
        aria-current={isActive ? "page" : undefined}
        className={`rounded-full px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200 ${
          isActive
            ? "bg-green-100 text-green-950"
            : "text-slate-600 hover:bg-green-50 hover:text-green-950"
        }`}
      >
        {item.label}
      </Link>
    );
  });

  const authActions = isAuthenticated ? (
    <div className="flex items-center gap-3">
      <span className="hidden max-w-36 truncate text-sm font-semibold text-green-950 lg:inline">
        {userLabel}
      </span>
      <form action={handleLogout}>
        <button
          type="submit"
          className="rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200"
        >
          Logout
        </button>
      </form>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="rounded-full px-4 py-2 text-sm font-semibold text-green-950 hover:bg-green-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200"
      >
        Login
      </Link>
      <Link
        href="/register"
        className="rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200"
      >
        Register
      </Link>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-green-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href={isAuthenticated ? "/dashboard" : "/"}
          className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200"
          aria-label="NutriNepal home"
        >
          <Image src="/image.png" alt="NutriNepal" width={150} height={56} className="h-11 w-[118px] object-contain sm:w-[142px]" priority />
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-1 md:flex">
          {navLinks}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? <button type="button" onClick={() => setIsCoachOpen(true)} className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-bold text-orange-900 transition hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200">Ask AI</button> : null}
          {authActions}
        </div>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-green-100 text-green-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200 md:hidden"
        >
          <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {isOpen ? (
        <div
          id="mobile-navigation"
          className="border-t border-green-100 bg-white px-4 py-4 shadow-md md:hidden"
        >
          <nav aria-label="Mobile navigation" className="mx-auto flex max-w-7xl flex-col gap-2">
            {navLinks}
            {isAuthenticated ? <button type="button" onClick={() => { setIsCoachOpen(true); setIsOpen(false); }} className="w-full rounded-xl bg-orange-500 px-4 py-3 text-left text-sm font-bold text-white hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200">Ask AI Coach</button> : null}
            <div className="mt-3 border-t border-green-100 pt-3">{authActions}</div>
          </nav>
        </div>
      ) : null}
      <AICoachDrawer open={isCoachOpen} onClose={() => setIsCoachOpen(false)} />
    </header>
  );
}
