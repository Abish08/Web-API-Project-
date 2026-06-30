export default function Footer() {
  return (
    <footer className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4">
      <p className="text-xs tracking-[0.5px] text-gray-500">
        © {new Date().getFullYear()} Nutri Nepal — Admin
      </p>
      <p className="text-xs tracking-[0.5px] text-gray-500">EN · Global</p>
    </footer>
  );
}