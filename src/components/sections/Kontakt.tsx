"use client";

import { useState, type FormEvent } from "react";
import SectionHeading from "@/components/SectionHeading";
import SectionReveal from "@/components/SectionReveal";

export default function Kontakt() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Anfrage von ${name || "Website"}`);
    const body = encodeURIComponent(
      `${message}\n\n---\nName: ${name}\nE-Mail: ${email}`
    );
    window.location.href = `mailto:kontakt@pivon.ai?subject=${subject}&body=${body}`;
  };

  return (
    <section
      id="kontakt"
      className="py-20 md:flex md:h-[calc(100vh-8rem)] md:items-center md:py-0 md:snap-start"
    >
      <SectionReveal className="mx-auto w-full max-w-7xl px-6">
        <SectionHeading
          number="05"
          title="Lassen Sie uns sprechen"
          description="Kontaktieren Sie uns einfach, unverbindlich und schnell für ein Erstgespräch."
        >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="mailto:kontakt@pivon.ai"
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm transition-colors hover:border-primary-blue"
            >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary-blue/10">
                <svg
                  className="h-5 w-5 text-primary-blue"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  E-Mail
                </p>
                <p className="font-semibold text-primary-navy">
                  kontakt@pivon.ai
                </p>
              </div>
            </a>

            <a
              href="tel:+4915199999788"
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm transition-colors hover:border-primary-blue"
            >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary-pink/10">
                <svg
                  className="h-5 w-5 text-primary-pink"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a1.5 1.5 0 001.5-1.5v-2.372a1.5 1.5 0 00-1.06-1.436l-4.155-1.245a1.5 1.5 0 00-1.417.376l-1.077 1.077a11.25 11.25 0 01-5.406-5.406l1.077-1.077a1.5 1.5 0 00.376-1.417L8.11 3.66a1.5 1.5 0 00-1.436-1.06H4.5a1.5 1.5 0 00-1.5 1.5v2.25z"
                  />
                </svg>
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Mobil
                </p>
                <p className="font-semibold text-primary-navy">
                  +49 151 99 99 788
                </p>
              </div>
            </a>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-primary-navy outline-none transition-colors focus:border-primary-blue"
                  placeholder="Ihr Name"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  E-Mail
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-primary-navy outline-none transition-colors focus:border-primary-blue"
                  placeholder="name@firma.de"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="message"
                className="text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Nachricht
              </label>
              <textarea
                id="message"
                required
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-primary-navy outline-none transition-colors focus:border-primary-blue"
                placeholder="Wie können wir Ihnen helfen?"
              />
            </div>
            <button
              type="submit"
              className="mt-1 rounded-full bg-primary-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-blue"
            >
              Nachricht senden
            </button>
          </form>
        </div>
        </SectionHeading>
      </SectionReveal>
    </section>
  );
}
