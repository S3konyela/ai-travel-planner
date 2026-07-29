import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Stays", href: "/#stays" },
  { label: "Flights", href: "/#flights" },
  { label: "Experiences", href: "/#experiences" },
  { label: "Car Rentals", href: "/#car-rentals" },
];

export function Header() {
  return (
    <header className="border-b border-black/5 dark:border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/icon.png" alt="" width={28} height={28} priority />
          <span className="text-xl font-bold tracking-tight text-tripora-navy dark:text-white">
            Trip<span className="tripora-gradient-text">ora</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-tripora-navy/70 dark:text-white/70 md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-tripora-navy dark:hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>

        <Link
          href="/plan"
          className="tripora-gradient-bg rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          Plan a trip
        </Link>
      </div>
    </header>
  );
}
