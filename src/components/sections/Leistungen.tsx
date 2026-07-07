"use client";

import { useEffect, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import SectionReveal from "@/components/SectionReveal";

const iconBg: Record<string, string> = {
  "primary-blue": "bg-primary-blue/10",
  "primary-pink": "bg-primary-pink/10",
  "primary-navy": "bg-primary-navy/10",
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
        className="w-7 h-7 text-primary-blue"
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
        className="w-7 h-7 text-primary-pink"
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
        className="w-7 h-7 text-primary-navy"
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
        className="w-7 h-7 text-primary-blue"
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
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeBullet, setActiveBullet] = useState<number | null>(null);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex]);

  const openService = openIndex !== null ? services[openIndex] : null;

  const closeModal = () => {
    setOpenIndex(null);
    setActiveBullet(null);
  };

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
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((svc, i) => {
              const expandable = Boolean(svc.text) || svc.bullets.length > 0;
              return (
                <button
                  type="button"
                  key={svc.label}
                  onClick={() => expandable && setOpenIndex(i)}
                  className={`rounded-3xl border border-slate-200 bg-white px-6 py-7 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5 ${
                    expandable ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <span
                    className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${iconBg[svc.color]}`}
                  >
                    {svc.icon}
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-primary-navy">
                    {svc.label}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">{svc.short}</p>
                  {expandable && (
                    <span className="mt-3 inline-block text-xs font-semibold text-primary-blue">
                      Mehr erfahren →
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </SectionHeading>
      </SectionReveal>

      {openService && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-primary-navy/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="animate-fade-in-up relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-8">
            <button
              type="button"
              onClick={closeModal}
              aria-label="Schließen"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-primary-navy"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <span
              className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconBg[openService.color]}`}
            >
              {openService.icon}
            </span>
            <h3 className="mt-4 text-2xl font-bold text-primary-navy">
              {openService.label}
            </h3>
            <p className="mt-1 text-slate-500">{openService.short}</p>

            {openService.text && (
              <p className="mt-6 text-justify text-base text-slate-700">
                {openService.text}
              </p>
            )}

            {openService.bullets.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {openService.bullets.map((b, bi) => (
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

            {activeBullet !== null &&
              openService.bullets[activeBullet]?.text && (
                <div className="animate-fade-in-up mt-5 rounded-xl border-l-4 border-primary-blue bg-slate-50 p-5">
                  <p className="text-justify text-base leading-relaxed text-slate-700">
                    {openService.bullets[activeBullet].text}
                  </p>
                  {openService.bullets[activeBullet].subBullets.length >
                    0 && (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {openService.bullets[activeBullet].subBullets.map(
                        (sb) => (
                          <li
                            key={sb}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm"
                          >
                            {sb}
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </div>
              )}
          </div>
        </div>
      )}
    </section>
  );
}
