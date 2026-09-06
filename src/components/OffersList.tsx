"use client";

import { useCallback, useMemo, useState } from "react";
import FiltersModal from "@/components/FiltersModal";
import FlightCard from "@/components/FlightCard";
import { airlineChips, BASE_CHIPS, matches, ROW_CHIP_IDS, type PriceRange } from "@/lib/filters";
import type { FlightOffer } from "@/lib/travelpayouts";

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
  const [price, setPrice] = useState<PriceRange>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const chips = useMemo(() => [...BASE_CHIPS, ...airlineChips(offers)], [offers]);
  const rowChips = chips.filter((c) => ROW_CHIP_IDS.has(c.id) || c.group === "airline");

  const toggle = (id: string) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const closeModal = useCallback(() => setModalOpen(false), []);

  const visible = offers.filter((o) => matches(o, active, price, chips));
  const avg = offers.length ? Math.round(offers.reduce((s, o) => s + o.price, 0) / offers.length) : 0;
  const bestId = visible[0]?.id; // offres déjà triées par prix
  const filterCount = active.size + (price ? 1 : 0);

  return (
    <>
      <div className="res-filters">
        <div className="wrap res-filters-in">
          <button
            className={`fchip fchip-main${filterCount ? " on" : ""}`}
            type="button"
            onClick={() => setModalOpen(true)}
            aria-haspopup="dialog"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0" />
              <circle cx="16" cy="6" r="2" />
              <circle cx="8" cy="12" r="2" />
              <circle cx="18" cy="18" r="2" />
            </svg>
            Filtres
            {filterCount ? <span className="fchip-badge">{filterCount}</span> : null}
          </button>
          <div className="fchips">
            {rowChips.map((c) => (
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
              <button
                type="button"
                className="empty-cta"
                onClick={() => {
                  setActive(new Set());
                  setPrice(null);
                }}
              >
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

      {modalOpen ? (
        <FiltersModal
          offers={offers}
          chips={chips}
          active={active}
          price={price}
          onApply={(a, p) => {
            setActive(a);
            setPrice(p);
          }}
          onClose={closeModal}
        />
      ) : null}
    </>
  );
}
