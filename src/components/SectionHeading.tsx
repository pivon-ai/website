import type { ReactNode } from "react";

export default function SectionHeading({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] md:gap-x-10">
      <div className="hidden md:relative md:col-start-1 md:block md:[grid-row:1/span_999]">
        <span
          aria-hidden
          className="select-none text-8xl font-black leading-none text-slate-100"
        >
          {number}
        </span>
        <span
          aria-hidden
          className="absolute bottom-0 left-16 top-24 w-0.5 bg-gradient-to-b from-primary-blue to-primary-pink"
        />
      </div>
      <h2 className="break-words text-4xl font-bold leading-[1.05] text-primary-navy md:col-start-2 md:text-6xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 max-w-2xl text-lg text-slate-600 md:col-start-2">
          {description}
        </p>
      )}
      {children && <div className="mt-8 md:col-start-2">{children}</div>}
    </div>
  );
}
