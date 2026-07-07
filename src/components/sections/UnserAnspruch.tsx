import SectionHeading from "@/components/SectionHeading";
import SectionReveal from "@/components/SectionReveal";

const traits = [
  "menschenzentriert",
  "transparent",
  "flexibel",
  "technologieunabhängig",
  "praxisorientiert",
];

export default function UnserAnspruch() {
  return (
    <section
      id="unser-anspruch"
      className="py-20 md:flex md:h-[calc(100vh-8rem)] md:items-center md:py-0 md:snap-start"
    >
      <SectionReveal className="mx-auto w-full max-w-7xl px-6">
        <SectionHeading
          number="03"
          title="Mensch, Organisation und Technologie im Einklang"
        >
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-12">
            <div className="relative mx-auto aspect-[400/350] w-full max-w-sm md:max-w-md">
              <svg viewBox="0 0 400 350" className="h-full w-full">
                <circle
                  cx="135"
                  cy="125"
                  r="95"
                  strokeWidth="2"
                  className="fill-primary-blue/[0.13] stroke-primary-blue"
                />
                <circle
                  cx="265"
                  cy="125"
                  r="95"
                  strokeWidth="2"
                  className="fill-primary-pink/[0.13] stroke-primary-pink"
                />
                <circle
                  cx="200"
                  cy="238"
                  r="95"
                  strokeWidth="2"
                  className="fill-primary-navy/[0.08] stroke-primary-navy"
                />
              </svg>
              <span className="absolute left-[18%] top-[22%] text-sm font-bold text-primary-blue md:text-lg">
                Mensch
              </span>
              <span className="absolute right-[15%] top-[22%] text-sm font-bold text-primary-pink md:text-lg">
                Organisation
              </span>
              <span className="absolute bottom-[12%] left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-bold text-primary-navy md:text-lg">
                Technologie
              </span>
            </div>

            <div>
              <p className="text-lg leading-relaxed text-slate-700">
                Die Basis unseres Handelns ist die gesamtheitliche Betrachtung
                von Mensch, Organisation und Technologie. Unsere Erfahrung ist
                das Ergebnis aus Erfolgen und Misserfolgen gleichermaßen. Sie
                ist unser Kompass, mit welchem wir Sie sicher durch die
                Herausforderungen der Zeit navigieren. Wir sind...
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {traits.map((trait) => (
                  <span
                    key={trait}
                    className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-primary-navy shadow-sm"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </SectionHeading>
      </SectionReveal>
    </section>
  );
}
