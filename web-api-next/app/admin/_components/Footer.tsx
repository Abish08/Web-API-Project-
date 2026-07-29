export default function Footer() {
  return (
    <footer className="flex items-center justify-between border-t border-green-100 bg-white px-6 py-4">
      <p className="text-xs tracking-[0.5px] text-slate-500">
        &copy; {new Date().getFullYear()} Nutri Nepal - Admin
      </p>
      <p className="text-xs tracking-[0.5px] text-slate-500">EN · Global</p>
    </footer>
  );
}