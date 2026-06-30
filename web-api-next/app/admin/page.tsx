import Link from "next/link";

const CARDS = [
  { href: "/admin/users", label: "Users", desc: "Manage accounts, roles and access." },
];

export default function AdminOverviewPage() {
  return (
    <section className="mx-auto w-full max-w-[1100px]">
      <p className="mb-2 text-xs font-bold uppercase tracking-[1.5px] text-gray-500">
        Admin
      </p>
      <h2 className="mb-8 text-3xl font-bold text-gray-900">Overview</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {CARDS.map(({ href, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-lg border border-gray-200 bg-white p-6 transition-colors hover:border-gray-400"
          >
            <h3 className="mb-1 text-lg font-bold text-gray-900">{label}</h3>
            <p className="text-sm text-gray-600">{desc}</p>
            <span className="mt-4 inline-block text-xs font-medium tracking-[0.5px] text-gray-700 opacity-0 transition-opacity group-hover:opacity-100">
              Manage →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}