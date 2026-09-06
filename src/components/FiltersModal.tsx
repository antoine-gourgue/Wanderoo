"use client";

import { useEffect, useMemo, useState } from "react";
import { matches, type Chip, type ChipGroup, type PriceRange } from "@/lib/filters";
import type { FlightOffer } from "@/lib/travelpayouts";

const GROUPS: { key: ChipGroup; title: string; sub?: string }[] = [
  { key: "stops", title: "Escales" },
  { key: "time", title: "Heure de départ", sub: "Heure locale à l'aéroport de départ" },
  { key: "duration", title: "Durée du vol" },
  { key: "airline", title: "Compagnies" },
];

const BUCKETS = 50;
const AIRLINES_SHOWN = 6;

function GroupIcon({ group }: { group: ChipGroup }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (group === "stops")
    return (
      <svg {...common}>
        <path d="M17.8 19.2 16 11l3.5-3.5a2.1 2.1 0 0 0-3-3L13 8 4.8 6.2a1 1 0 0 0-.9 1.7l5.6 3.6-2.3 4.2-2.7-.3-1 1 3.5 2 2 3.5 1-1-.3-2.7 4.2-2.3 3.6 5.6a1 1 0 0 0 1.7-.9Z" />
      </svg>
    );
  if (group === "time")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    );
  if (group === "duration")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  return null;
}

export default function FiltersModal({
  offers,
  chips,
  active,
  price,
  onApply,
  onClose,
}: {
  offers: FlightOffer[];
  chips: Chip[];
  active: Set<string>;
  price: PriceRange;
  onApply: (active: Set<string>, price: PriceRange) => void;
  onClose: () => void;
}) {
  const prices = offers.map((o) => o.price);
  const min = prices.length ? Math.min(...prices) : 0;
  const max = prices.length ? Math.max(...prices) : 0;

  // Monté uniquement quand la modale est ouverte : l'état brouillon part des props.
  const [draft, setDraft] = useState<Set<string>>(() => new Set(active));
  const [range, setRange] = useState<[number, number]>(() => price ?? [min, max]);
  const [showAllAirlines, setShowAllAirlines] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const span = Math.max(1, max - min);
  const histogram = useMemo(() => {
    const counts = Array.from({ length: BUCKETS }, () => 0);
    for (const p of prices) counts[Math.min(BUCKETS - 1, Math.floor(((p - min) / span) * BUCKETS))]++;
    const peak = Math.max(1, ...counts);
    return counts.map((c, i) => ({
      h: c ? Math.max(4, Math.round((c / peak) * 60)) : 0,
      lo: min + (span * i) / BUCKETS,
      hi: min + (span * (i + 1)) / BUCKETS,
    }));
  }, [prices, min, span]);

  const rangeOrNull: PriceRange = range[0] <= min && range[1] >= max ? null : range;
  const count = offers.filter((o) => matches(o, draft, rangeOrNull, chips)).length;
  const dirty = draft.size > 0 || rangeOrNull !== null;
  const pct = (v: number) => ((v - min) / span) * 100;

  function toggle(id: string) {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function setMin(v: number) {
    setRange(([, hi]) => [Math.max(min, Math.min(v, hi)), hi]);
  }
  function setMax(v: number) {
    setRange(([lo]) => [lo, Math.min(max, Math.max(v, lo))]);
  }

  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Filtres">
        <div className="modal-h">
          Filtres
          <button type="button" className="modal-x" onClick={onClose} aria-label="Fermer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="modal-b">
          <section className="fsec">
            <h3>Fourchette de prix</h3>
            <p className="fsec-sub">Prix aller-retour, taxes et frais compris</p>
            <div className="hist" aria-hidden="true">
              {histogram.map((b, i) => (
                <i key={i} className={b.hi >= range[0] && b.lo <= range[1] ? "" : "off"} style={{ height: `${b.h}px` }} />
              ))}
            </div>
            <div className="range">
              <div className="range-track" />
              <div className="range-sel" style={{ left: `${pct(range[0])}%`, right: `${100 - pct(range[1])}%` }} />
              <input type="range" min={min} max={max} value={range[0]} onChange={(e) => setMin(Number(e.target.value))} aria-label="Prix minimum" />
              <input type="range" min={min} max={max} value={range[1]} onChange={(e) => setMax(Number(e.target.value))} aria-label="Prix maximum" />
            </div>
            <div className="rng-boxes">
              <label className="rng-box">
                <span>Minimum</span>
                <div className="rng-val">
                  <span>€</span>
                  <input type="number" value={range[0]} min={min} max={range[1]} onChange={(e) => setMin(Number(e.target.value))} />
                </div>
              </label>
              <span className="rng-dash" aria-hidden="true" />
              <label className="rng-box">
                <span>Maximum</span>
                <div className="rng-val">
                  <span>€</span>
                  <input type="number" value={range[1]} min={range[0]} max={max} onChange={(e) => setMax(Number(e.target.value))} />
                </div>
              </label>
            </div>
          </section>

          {GROUPS.map((g) => {
            let list = chips.filter((c) => c.group === g.key);
            if (list.length === 0) return null;
            const collapsible = g.key === "airline" && list.length > AIRLINES_SHOWN;
            if (collapsible && !showAllAirlines) list = list.slice(0, AIRLINES_SHOWN);
            return (
              <section className="fsec" key={g.key}>
                <h3>{g.title}</h3>
                {g.sub ? <p className="fsec-sub">{g.sub}</p> : null}
                <div className="pills">
                  {list.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`pill${draft.has(c.id) ? " on" : ""}`}
                      aria-pressed={draft.has(c.id)}
                      onClick={() => toggle(c.id)}
                    >
                      {g.key === "airline" ? (
                        <span className="pill-code" aria-hidden="true">
                          {c.id.replace("al-", "")}
                        </span>
                      ) : (
                        <GroupIcon group={g.key} />
                      )}
                      {c.label}
                    </button>
                  ))}
                </div>
                {collapsible ? (
                  <button type="button" className="more-link" onClick={() => setShowAllAirlines((s) => !s)}>
                    {showAllAirlines ? "Afficher moins" : "Afficher plus"}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {showAllAirlines ? <path d="m6 15 6-6 6 6" /> : <path d="m6 9 6 6 6-6" />}
                    </svg>
                  </button>
                ) : null}
              </section>
            );
          })}
        </div>

        <div className="modal-f">
          <button
            type="button"
            className="btn-clear"
            disabled={!dirty}
            onClick={() => {
              setDraft(new Set());
              setRange([min, max]);
            }}
          >
            Tout effacer
          </button>
          <button
            type="button"
            className="btn-apply"
            onClick={() => {
              onApply(draft, rangeOrNull);
              onClose();
            }}
          >
            Afficher {count} vol{count > 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
