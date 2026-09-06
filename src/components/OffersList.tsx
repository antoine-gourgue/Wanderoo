"use client";

import { useMemo, useState } from "react";
import FlightCard from "@/components/FlightCard";
import { airlineName, type FlightOffer } from "@/lib/travelpayouts";

type Chip = { id: string; label: string; test: (o: FlightOffer) => boolean };

const hourOf = (iso: string) => Number(iso.match(/T(\d{2})/)?.[1] ?? 0);

const BASE_CHIPS: Chip[] = [
  { id: "direct", label: "Direct", test: (o) => o.transfers === 0 },
  { id: "max1", label: "1 escale max", test: (o) => o.transfers <= 1 },
  { id: "morning", label: "Matin", test: (o) => hourOf(o.departAt) < 12 },
  { id: "afternoon", label: "Après-midi", test: (o) => hourOf(o.departAt) >= 12 && hourOf(o.departAt) < 18 },
  { id: "evening", label: "Soir", test: (o) => hourOf(o.departAt) >= 18 },
  { id: "lt100", label: "Moins de 100 €", test: (o) => o.price < 100 },
  { id: "lt200", label: "Moins de 200 €", test: (o) => o.price < 200 },
];

export default function OffersList({
  offers,
  title,
  demo,
  side,
}: {
  offers: FlightOffer[];
  title: string;
  demo: boolean;
  side: React.ReactNode;
}) {
  const [active, setActive] = useState<Set<string>>(() => new Set());

  const chips = useMemo<Chip[]>(() => {
    const airlines = [...new Set(offers.map((o) => o.airline))];
    return [
      ...BASE_CHIPS,
      ...airlines.map((a) => ({ id: `al-${a}`, label: airlineName(a), test: (o: FlightOffer) => o.airline === a })),
    ];
  }, [offers]);

  const toggle = (id: string) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const visible = offers.filter((o) => chips.every((c) => !active.has(c.id) || c.test(o)));
  const avg = offers.length ? Math.round(offers.reduce((s, o) => s + o.price, 0) / offers.length) : 0;
  const bestId = visible[0]?.id; // offres déjà triées par prix

  return (
    <>
      <div className="res-filters">
        <div className="wrap res-filters-in">
          <button className="fchip fchip-main" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0" />
              <circle cx="16" cy="6" r="2" />
              <circle cx="8" cy="12" r="2" />
              <circle cx="18" cy="18" r="2" />
            </svg>
            Filtres
          </button>
          <div className="fchips">
            {chips.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`fchip${active.has(c.id) ? " on" : ""}`}
                aria-pressed={active.has(c.id)}
                onClick={() => toggle(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="wrap res-body">
        <section className="res-list">
          <h1 className="res-title">
            {title} : {visible.length} vol{visible.length > 1 ? "s" : ""}
          </h1>
          <p className="res-rank">
            Classement des résultats
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8h.01M11 12h1v4h1" />
            </svg>
            {demo ? <span> · Données de démonstration — ajoutez un token Travelpayouts pour les vrais prix</span> : null}
          </p>

          {visible.length === 0 ? (
            <div className="empty">
              <p>Aucun vol ne correspond à ces filtres.</p>
              <button type="button" className="empty-cta" onClick={() => setActive(new Set())}>
                Effacer les filtres
              </button>
            </div>
          ) : (
            <div className="res-grid">
              {visible.map((o) => (
                <FlightCard key={o.id} offer={o} best={o.id === bestId} avg={avg} />
              ))}
            </div>
          )}

          <p className="affiliate-note">
            Wanderoo peut toucher une commission si vous réservez via un partenaire. Le prix que vous payez reste identique.
          </p>
        </section>

        <aside className="res-side">{side}</aside>
      </main>
    </>
  );
}
