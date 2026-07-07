import NeuralOrb from "@/components/three/NeuralOrb";
import SectionReveal from "@/components/SectionReveal";

const traits = [
  "menschenzentriert",
  "transparent",
  "flexibel",
  "technologieunabhängig",
  "praxisorientiert",
];

export default function Hero() {
  return (
    <section className="relative w-full py-16 md:flex md:h-[calc(100vh-8rem)] md:items-center md:py-0 md:snap-start">
      <SectionReveal className="relative mx-auto w-full max-w-7xl px-6">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[3fr_2fr] md:gap-2">
          <div className="animate-fade-in-up text-center md:text-left">
            <p className="inline-block rounded-full bg-primary-blue/10 px-4 py-1.5 text-sm font-semibold text-primary-blue">
              KI-Beratung &amp; Entwicklung
            </p>
            <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-primary-navy leading-[1.08]">
              KI strategisch <span className="gradient-text">denken</span> und
              pragmatisch umsetzen
            </h1>
            <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-xl mx-auto md:mx-0">
              Wir helfen Ihnen Ihre Ideen mit messbarem Erfolg umzusetzen.
            </p>
          </div>

          <div className="relative h-72 md:h-[22rem]">
            <NeuralOrb />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-slate-100 pt-6 md:mt-6">
          {traits.map((trait) => (
            <span
              key={trait}
              className="text-sm font-medium text-slate-500 tracking-wide"
            >
              {trait}
            </span>
          ))}
        </div>
      </SectionReveal>
    </section>
  );
}
