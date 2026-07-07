"use client";

import { useEffect, useRef, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import SectionReveal from "@/components/SectionReveal";

const iconBg: Record<string, string> = {
  "primary-blue": "bg-primary-blue/10",
  "primary-pink": "bg-primary-pink/10",
  "primary-navy": "bg-primary-navy/10",
};

const iconText: Record<string, string> = {
  "primary-blue": "text-primary-blue",
  "primary-pink": "text-primary-pink",
  "primary-navy": "text-primary-navy",
};

const services = [
  {
    label: "Beratung",
    short:
      "Strategische KI-Beratung – von der Potenzialanalyse bis zur Roadmap.",
    text: 'Wir verstehen Beratung nicht als einen Monolog, der Ihnen etwas verkaufen will, sondern als einen Dialog, in welchem wir verstehen wollen, wo Sie stehen und wo Sie hin wollen. Nur so können wir Ihnen einen "Ratschlag" geben, der Ihnen hilft Ihre Ziele zu erreichen. Beratung bedeutet für uns den ganzheitlichen Dreiklang aus Mensch, Organisation und Technologie zu betrachten.',
    bullets: [
      {
        label: "Ist-Soll Analyse",
        text: '"Wie geht es Ihnen?" Eine oft gestellte und nicht ernst gemeinte Frage unter Bekannten. Für uns der Anfang unserer Beziehung. Wenn wir nicht verstehen, wie es Ihnen geht und was sie schmerzt, können wir Ihnen nicht helfen. Für uns ist die Ist-Soll Analyse der Beginn um einen umfassenden Einblick in Ihre Welt zu bekommen.',
        subBullets: [
          "Mindset",
          "Kompetenzen",
          "Governance",
          "Prozesse",
          "Datenbasis",
          "Technologie",
        ],
      },
      {
        label: "Use Case",
        text: "Alle sprechen über Use Cases und was alles erreicht werden kann. Leider kann der messbare Mehrwert meistens nicht qualifiziert formuliert werden. Ein Use Case ohne Mehrwert wird nicht gebraucht, leider ist die Realität meistens anders. Deswegen helfen wir Ihnen.",
        subBullets: ["Ist-Soll Analyse", "Technische Machbarkeit"],
      },
      {
        label: "Tech Advisory",
        text: "Technologie ist Teil unserer DNA und unserer Passion. Unser umfassendes Wissen über alle Ebenen der Informationstechnologie ermöglicht es uns, für alle Fragestellungen und Probleme eine Lösung zu finden. Lösungen müssen nicht kompliziert sein, sondern sie müssen einen messbaren Mehrwert erzeugen.",
        subBullets: [
          "Generative Sprachmodelle (LLM)",
          "Retriever Augmented Generation (RAG)",
          "Technologie Stacks",
          "Software Architektur",
          "Integrationsberatung",
          "Entscheidungsfindung",
          "Tool- und Plattformauswahl",
        ],
      },
      {
        label: "Executive Beratung",
        text: "Sprache ist so unterschiedlich wie die Menschen und Organisationen selbst. Wir sind sehr sprachbegabt, sprechen unterschiedlichste Dialekte und lernen gerne dazu. Es ist wichtig die Menschen zu erreichen und vor allem den Verantwortlichen die Möglichkeit zu geben zu entscheiden. Deswegen haben wir spezielle Informationsparameter.",
        subBullets: [
          "Quick Wins",
          "Langfristiger ROI",
          "Adoption Rate",
          "Risikobewertung",
        ],
      },
    ],
    color: "primary-blue",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
        />
      </svg>
    ),
  },
  {
    label: "Quickstart KI",
    short:
      "Schneller Einstieg – vom Konzept zum ersten Ergebnis in kürzester Zeit.",
    text: "Die Basis allem unseres Handelns ist der Dreiklang aus Mensch, Organisation und Technologie. Dies gilt auch für die Einführung rund um das Thema KI. Wir bieten neben unseren etablierten Standardpaketen auch individuelle und auf Sie zugeschnittene Einführungsveranstaltungen.",
    bullets: [
      { label: "Mensch", text: "", subBullets: [] as string[] },
      { label: "Organisation", text: "", subBullets: [] as string[] },
      { label: "Technologie", text: "", subBullets: [] as string[] },
    ],
    color: "primary-pink",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
        />
      </svg>
    ),
  },
  {
    label: "Entwicklung",
    short:
      "Individuelle Entwicklung von KI-Lösungen, maßgeschneidert für Sie.",
    text: "",
    bullets: [] as { label: string; text: string; subBullets: string[] }[],
    color: "primary-navy",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
        />
      </svg>
    ),
  },
  {
    label: "Startup Creator",
    short:
      "Von der Idee zum Venture – Aufbau KI-basierter Geschäftsmodelle.",
    text: "",
    bullets: [] as { label: string; text: string; subBullets: string[] }[],
    color: "primary-blue",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.06m5.96 6.31a14.94 14.94 0 01-5.96-6.31m0 0a14.926 14.926 0 00-5.841 2.58m-.001 4.8a6 6 0 001.83 4.22m4.011-6.8a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
        />
      </svg>
    ),
  },
];

export default function Leistungen() {
  const [active, setActive] = useState(0);
  const [activeBullet, setActiveBullet] = useState<number | null>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measure = () => {
      const el = tabRefs.current[active];
      const nav = navRef.current;
      if (!el || !nav) return;
      const elRect = el.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      setIndicator({ left: elRect.left - navRect.left, width: elRect.width });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  const selectTab = (i: number) => {
    setActive(i);
    setActiveBullet(null);
  };

  const svc = services[active];

  return (
    <section
      id="leistungen"
      className="py-20 md:flex md:h-[calc(100vh-8rem)] md:items-center md:py-0 md:snap-start"
    >
      <SectionReveal className="mx-auto w-full max-w-7xl px-6">
        <SectionHeading
          number="01"
          title="Ganzheitlich von der Idee bis zum Betrieb"
          description="Wir unterstützen Sie mit unseren Leistungen ganzheitlich. Von der Einführung bis zur Entwicklung und Umsetzung von KI-basierten Lösungen."
        >
          <div
            ref={navRef}
            className="relative flex w-full gap-1 overflow-x-auto rounded-2xl bg-slate-100 p-1.5 md:inline-flex md:w-auto"
          >
            <div
              className="absolute top-1.5 bottom-1.5 rounded-xl bg-white shadow-sm transition-all duration-300 ease-out"
              style={{ left: indicator.left, width: indicator.width }}
            />
            {services.map((s, i) => (
              <button
                key={s.label}
                type="button"
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                onClick={() => selectTab(i)}
                className={`relative z-10 flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  active === i
                    ? iconText[s.color]
                    : "text-slate-500 hover:text-primary-navy"
                }`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </div>

          <div
            key={active}
            className="animate-fade-in-up mt-6 rounded-3xl border border-slate-200 bg-white p-6 md:p-8"
          >
            <div className="flex items-center gap-4">
              <span
                className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${iconBg[svc.color]}`}
              >
                <span className={`${iconText[svc.color]} [&>svg]:h-7 [&>svg]:w-7`}>
                  {svc.icon}
                </span>
              </span>
              <div>
                <h3 className="text-xl font-bold text-primary-navy md:text-2xl">
                  {svc.label}
                </h3>
                <p className="text-sm text-slate-500">{svc.short}</p>
              </div>
            </div>

            {svc.text && (
              <p className="mt-5 text-justify text-base text-slate-700">
                {svc.text}
              </p>
            )}

            {svc.bullets.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {svc.bullets.map((b, bi) => (
                  <button
                    key={b.label}
                    type="button"
                    className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                      activeBullet === bi
                        ? "scale-[1.03] border-primary-blue bg-primary-blue text-white shadow-md"
                        : "border-slate-200 bg-white text-primary-navy hover:border-primary-blue hover:text-primary-blue hover:shadow-sm"
                    }`}
                    onClick={() =>
                      setActiveBullet(activeBullet === bi ? null : bi)
                    }
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            )}

            {activeBullet !== null && svc.bullets[activeBullet]?.text && (
              <div className="animate-fade-in-up mt-5 rounded-xl border-l-4 border-primary-blue bg-slate-50 p-5">
                <p className="text-justify text-base leading-relaxed text-slate-700">
                  {svc.bullets[activeBullet].text}
                </p>
                {svc.bullets[activeBullet].subBullets.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {svc.bullets[activeBullet].subBullets.map((sb) => (
                      <li
                        key={sb}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm"
                      >
                        {sb}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </SectionHeading>
      </SectionReveal>
    </section>
  );
}
