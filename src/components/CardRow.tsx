"use client";

import { useRef } from "react";

export default function CardRow({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function slide(dir: -1 | 1) {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth - 120), behavior: "smooth" });
  }

  return (
    <section className="row">
      <div className="row-h">
        <h2 className="row-title">
          {title}
          <svg className="row-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </h2>
        <div className="row-nav">
          <button className="chev" onClick={() => slide(-1)} aria-label="Précédent">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 6-6 6 6 6" />
            </svg>
          </button>
          <button className="chev" onClick={() => slide(1)} aria-label="Suivant">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
      <div className="row-scroll" ref={ref}>
        {children}
      </div>
    </section>
  );
}
