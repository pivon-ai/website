"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Startseite", href: "#" },
  {
    label: "Leistungen",
    href: "#leistungen",
    submenu: [
      { label: "Beratung", href: "#leistungen" },
      { label: "Quickstart KI", href: "#leistungen" },
      { label: "Entwicklung", href: "#leistungen" },
      { label: "Startup Creator", href: "#leistungen" },
    ],
  },
  { label: "Vorgehen", href: "#vorgehen" },
  { label: "Unser Anspruch", href: "#unser-anspruch" },
  { label: "Über uns", href: "#ueber-uns" },
  { label: "Kontakt", href: "#kontakt" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-white/80 backdrop-blur-md transition-shadow ${
        scrolled ? "shadow-[0_1px_0_0_rgba(15,23,42,0.08)]" : ""
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-2 lg:gap-10">
        <Link href="/" className="flex-shrink-0 flex items-center gap-2">
          <Image
            src="/images/logo-transparent.png"
            alt="pivon Logo"
            width={300}
            height={85}
            priority
            className="h-24 w-auto md:h-28"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex flex-1 items-center gap-8">
          {navItems.map((item) => (
            <div key={item.href} className="relative group">
              <a
                href={item.href}
                className="relative text-[15px] font-medium text-primary-navy/80 hover:text-primary-navy transition-colors pb-1 after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 after:bg-primary-blue after:transition-all after:duration-300 hover:after:w-full"
              >
                {item.label}
              </a>
              {item.submenu && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-out z-50">
                  <div className="bg-white rounded-xl shadow-xl shadow-slate-900/10 border border-slate-100 py-2 min-w-[180px] divide-y divide-slate-100">
                    {item.submenu.map((sub) => (
                      <a
                        key={sub.label}
                        href={sub.href}
                        className="block px-4 py-2.5 text-sm text-primary-navy hover:bg-slate-50 hover:text-primary-blue transition-colors"
                      >
                        {sub.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          <a
            href="#kontakt"
            className="ml-auto rounded-full bg-primary-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-blue"
          >
            Erstgespräch vereinbaren
          </a>
        </nav>

        {/* Mobile Hamburger */}
        <button
          type="button"
          className="lg:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menü öffnen"
          aria-expanded={mobileOpen}
        >
          <span
            className={`block h-0.5 w-6 bg-primary-navy transition-transform ${
              mobileOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-primary-navy transition-opacity ${
              mobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-primary-navy transition-transform ${
              mobileOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-slate-100 bg-white animate-[fadeIn_0.2s_ease-in]">
          <div className="flex flex-col px-6 py-4 gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-primary-navy hover:bg-slate-50 hover:text-primary-blue transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a
              href="#kontakt"
              className="mt-2 rounded-full bg-primary-navy px-5 py-2.5 text-center text-sm font-semibold text-white"
              onClick={() => setMobileOpen(false)}
            >
              Erstgespräch vereinbaren
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
