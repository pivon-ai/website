"use client";

import { useState, useRef, useEffect } from "react";
import SectionHeading from "@/components/SectionHeading";
import SectionReveal from "@/components/SectionReveal";

const steps = [
  {
    label: "Kontakt",
    text: "Kontaktieren Sie uns einfach, unverbindlich und schnell für ein Erstgespräch.\n\nEmail: kontakt@pivon.ai\nMobil: +49 151 99 99 788",
  },
  {
    label: "Auftragsklärung",
    text: "Auftragsklärung bedeutet für uns im Dialog zu verstehen, was Ihr Bedürfnis ist, oder was Ihr Bedürfnis sein könnte.",
  },
  {
    label: "Umsetzung",
    text: "Die Umsetzung von KI-Leistungen erfordert Flexibilität und Geschwindigkeit. Wir arbeiten mit agilen Methoden wie Scrum oder Kanban, um sicherzustellen, dass wir die definierten Ziele erreichen.",
  },
  {
    label: "Übergabe",
    text: "Übergabe heißt für uns sicherzustellen, dass Sie unsere Leistungen selbst Anwenden und Umsetzen können. Und trotzdem sind wir jederzeit für Sie da!",
  },
];

export default function Vorgehen() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [connectorLeft, setConnectorLeft] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      activeStep !== null &&
      stepRefs.current[activeStep] &&
      containerRef.current
    ) {
      const stepEl = stepRefs.current[activeStep];
      const containerEl = containerRef.current;
      const stepRect = stepEl!.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();
      setConnectorLeft(
        stepRect.left + stepRect.width / 2 - containerRect.left
      );
    }
  }, [activeStep]);

  return (
    <section
      id="vorgehen"
      className="py-20 md:flex md:h-[calc(100vh-8rem)] md:items-center md:py-0 md:snap-start"
    >
      <SectionReveal className="mx-auto w-full max-w-7xl px-6">
        <SectionHeading
          number="02"
          title="In vier klaren Schritten zum Ziel"
        >
        <div className="bg-white rounded-2xl border border-slate-200 px-8 py-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start gap-4 md:gap-0">
            {steps.map((step, i) => (
              <div key={step.label} className="contents">
                <div
                  ref={(el) => {
                    stepRefs.current[i] = el;
                  }}
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() => setActiveStep(activeStep === i ? null : i)}
                >
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl transition-all ring-offset-2 ${
                      activeStep === i
                        ? "bg-primary-blue scale-110 ring-2 ring-primary-blue"
                        : "bg-primary-pink hover:scale-105 hover:ring-2 hover:ring-primary-blue/50"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className="mt-3 text-base font-semibold text-primary-navy group-hover:text-primary-blue transition-colors">
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <>
                    <div className="hidden md:flex flex-1 items-center mx-3 mt-10">
                      <div className="flex-1 h-1 bg-primary-pink" />
                      <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-l-[12px] border-transparent border-l-primary-pink" />
                    </div>
                    <div className="md:hidden w-1 h-8 bg-primary-pink mx-auto" />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        {activeStep !== null && steps[activeStep].text && (
          <>
            <div
              ref={containerRef}
              className="relative h-6 animate-[fadeIn_0.3s_ease-in]"
            >
              <div
                className="absolute top-0 bottom-0 flex flex-col items-center justify-center transition-all duration-300"
                style={{
                  left: `${connectorLeft}px`,
                  transform: "translateX(-50%)",
                }}
              >
                <div className="w-0.5 flex-1 bg-slate-300" />
                <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-slate-300 -mb-1" />
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 px-8 py-6 shadow-sm w-full animate-[fadeIn_0.3s_ease-in]">
              <p className="text-center text-slate-700 text-base whitespace-pre-line">
                {steps[activeStep].text}
              </p>
            </div>
          </>
        )}
        </SectionHeading>
      </SectionReveal>
    </section>
  );
}
