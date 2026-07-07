import Image from "next/image";
import SectionHeading from "@/components/SectionHeading";
import SectionReveal from "@/components/SectionReveal";

export default function UeberUns() {
  return (
    <section
      id="ueber-uns"
      className="py-20 md:flex md:h-[calc(100vh-8rem)] md:items-center md:py-0 md:snap-start"
    >
      <SectionReveal className="mx-auto w-full max-w-7xl px-6">
        <SectionHeading
          number="04"
          title="Wer hinter pivon steht"
        >
        <div className="flex flex-col items-center gap-6 bg-white rounded-2xl border border-slate-200 px-8 py-10 shadow-sm text-center">
          <Image
            src="/images/logo-icon.png"
            alt=""
            width={56}
            height={49}
            className="h-12 w-auto opacity-80"
          />
          <p className="text-lg text-slate-600 max-w-md">
            Ausführliche Informationen zu unserem Team folgen in Kürze.
            Schreiben Sie uns gerne direkt – wir lernen uns am liebsten im
            persönlichen Gespräch kennen.
          </p>
          <a
            href="#kontakt"
            className="rounded-full bg-primary-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-blue"
          >
            Kontakt aufnehmen
          </a>
        </div>
        </SectionHeading>
      </SectionReveal>
    </section>
  );
}
