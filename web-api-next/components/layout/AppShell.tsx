"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { UserHeader } from "./UserHeader";

const HIDDEN_HEADER_PREFIXES = [
  "/admin",
  "/login",
  "/register",
  "/forgot-password",
  "/verify-otp",
  "/reset-password",
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideHeader = HIDDEN_HEADER_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  return (
    <>
      {hideHeader ? null : <UserHeader />}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </>
  );
}
