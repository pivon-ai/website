import Image from "next/image";
import SectionReveal from "@/components/SectionReveal";

const legalLinks = [
  { label: "Impressum", href: "#" },
  { label: "Datenschutz", href: "#" },
];

const navLinks = [
  { label: "Leistungen", href: "#leistungen" },
  { label: "Vorgehen", href: "#vorgehen" },
  { label: "Unser Anspruch", href: "#unser-anspruch" },
  { label: "Über uns", href: "#ueber-uns" },
  { label: "Kontakt", href: "#kontakt" },
];

export default function Footer() {
  return (
    <footer className="relative flex flex-col bg-primary-navy text-white md:h-[calc(100vh-8rem)] md:snap-start">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 inset-x-0 h-20 bg-gradient-to-b from-transparent to-primary-navy"
      />
      <div className="flex flex-1 items-center">
        <SectionReveal className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 py-14 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <Image
                src="/images/logo-icon.png"
                alt=""
                width={64}
                height={56}
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-white">pivon</span>
            </div>
            <p className="mt-4 text-sm text-white/60 max-w-xs">
              Ihr Partner für digitale Lösungen – KI strategisch denken und
              pragmatisch umsetzen.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-white/90 mb-4">
              Navigation
            </p>
            <ul className="space-y-2.5">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white/90 mb-4">
              Kontakt
            </p>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li>
                <a
                  href="mailto:kontakt@pivon.ai"
                  className="hover:text-white transition-colors"
                >
                  kontakt@pivon.ai
                </a>
              </li>
              <li>
                <a
                  href="tel:+4915199999788"
                  className="hover:text-white transition-colors"
                >
                  +49 151 99 99 788
                </a>
              </li>
            </ul>
          </div>
        </SectionReveal>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl flex flex-col-reverse md:flex-row items-center justify-between gap-4 px-6 py-6">
          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} pivon. Alle Rechte vorbehalten.
          </p>
          <div className="flex gap-6 text-xs text-white/50">
            {legalLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="hover:text-white/80 transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
