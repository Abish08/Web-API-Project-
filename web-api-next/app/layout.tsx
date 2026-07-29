import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "NutriNepal",
  description: "Personalized diet and fitness recommendation system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-[radial-gradient(circle_at_top_left,rgba(220,252,231,0.95),transparent_34%),linear-gradient(135deg,#f0fdf4_0%,#fff7ed_45%,#eff6ff_100%)] text-slate-950">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
