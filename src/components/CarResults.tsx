"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CardRow from "@/components/CardRow";
import CarCard from "@/components/CarCard";
import CarIllustration, { CATEGORY_TINT } from "@/components/CarIllustration";
import { CAR_CATEGORIES, type CarCategory, type CarOffer, type Transmission } from "@/lib/cars";

type DropKey = "transmission" | "supplier";

export default function CarResults({
  cars,
  cityName,
  dateLabel,
  demo,
  savedSlugs,
}: {
  cars: CarOffer[];
  cityName: string;
  dateLabel: string;
  demo: boolean;
  savedSlugs: string[];
}) {
  const [category, setCategory] = useState<CarCategory | null>(null);
  const [transmission, setTransmission] = useState<Transmission | null>(null);
  const [suppliers, setSuppliers] = useState<Set<string>>(() => new Set());
  const [open, setOpen] = useState<DropKey | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const saved = useMemo(() => new Set(savedSlugs), [savedSlugs]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const allSuppliers = useMemo(() => [...new Set(cars.map((c) => c.supplier))].sort(), [cars]);

  const visible = cars.filter(
    (c) =>
      (!category || c.category === category) &&
      (!transmission || c.transmission === transmission) &&
      (suppliers.size === 0 || suppliers.has(c.supplier)),
  );

  const rows: { title: string; cars: CarOffer[] }[] = [
    { title: `Les plus populaires à ${cityName}`, cars: [...visible].sort((a, b) => b.reviews - a.reviews) },
    { title: "Petits prix", cars: [...visible].sort((a, b) => a.pricePerDay - b.pricePerDay) },
    { title: "Boîte automatique", cars: visible.filter((c) => c.transmission === "Automatique") },
    { title: "Électriques", cars: visible.filter((c) => c.electric) },
  ].filter((r) => r.cars.length > 0);

  const countLabel = `${visible.length} véhicule${visible.length > 1 ? "s" : ""}`;
  const activeFilters = (category ? 1 : 0) + (transmission ? 1 : 0) + suppliers.size;

  return (
    <>
      <div className="res-filters" ref={barRef}>
        <div className="wrap res-filters-in">
          <button className={`fchip fchip-main${activeFilters ? " on" : ""}`} type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0" />
              <circle cx="16" cy="6" r="2" />
              <circle cx="8" cy="12" r="2" />
              <circle cx="18" cy="18" r="2" />
            </svg>
            Filtres
            {activeFilters ? <span className="fchip-badge">{activeFilters}</span> : null}
          </button>
          <span className="fsep" aria-hidden="true" />

          <div className="dd">
            <button
              type="button"
              className={`fchip fchip-dd${transmission ? " on" : ""}`}
              aria-expanded={open === "transmission"}
              onClick={() => setOpen(open === "transmission" ? null : "transmission")}
            >
              {transmission ?? "Boîte de vitesses"}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {open === "transmission" ? (
              <div className="dd-pop">
                {(["Manuelle", "Automatique"] as Transmission[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`pill${transmission === t ? " on" : ""}`}
                    onClick={() => {
                      setTransmission(transmission === t ? null : t);
                      setOpen(null);
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="dd">
            <button
              type="button"
              className={`fchip fchip-dd${suppliers.size ? " on" : ""}`}
              aria-expanded={open === "supplier"}
              onClick={() => setOpen(open === "supplier" ? null : "supplier")}
            >
              {suppliers.size ? `Loueur · ${suppliers.size}` : "Loueur"}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {open === "supplier" ? (
              <div className="dd-pop">
                {allSuppliers.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`pill${suppliers.has(s) ? " on" : ""}`}
                    aria-pressed={suppliers.has(s)}
                    onClick={() =>
                      setSuppliers((prev) => {
                        const next = new Set(prev);
                        if (next.has(s)) next.delete(s);
                        else next.add(s);
                        return next;
                      })
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <main className="wrap cars">
        <div className="row-h">
          <h2 className="row-title">{cityName} · Voitures</h2>
        </div>
        <p className="res-rank">
          {countLabel}
          {dateLabel ? ` · ${dateLabel}` : ""}
          {demo ? " · Données de démonstration" : ""}
        </p>

        <div className="ctiles" role="tablist" aria-label="Type de véhicule">
          {CAR_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={category === c}
              className={`ctile${category === c ? " on" : ""}`}
              onClick={() => setCategory(category === c ? null : c)}
            >
              <span className="ctile-box" style={{ background: CATEGORY_TINT[c] }}>
                <CarIllustration category={c} className="ctile-ill" />
              </span>
              <span className="ctile-lbl">{c}</span>
            </button>
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="empty">
            <p>Aucun véhicule ne correspond à ces filtres.</p>
            <button
              type="button"
              className="empty-cta"
              onClick={() => {
                setCategory(null);
                setTransmission(null);
                setSuppliers(new Set());
              }}
            >
              Effacer les filtres
            </button>
          </div>
        ) : (
          rows.map((r) => (
            <CardRow key={r.title} title={r.title}>
              {r.cars.map((c) => (
                <CarCard key={c.id} car={c} saved={saved.has(`car-${c.id}`)} />
              ))}
            </CardRow>
          ))
        )}

        <p className="affiliate-note">
          Wanderoo peut toucher une commission si vous réservez via un partenaire. Le prix que vous payez reste identique.
        </p>
      </main>
    </>
  );
}
