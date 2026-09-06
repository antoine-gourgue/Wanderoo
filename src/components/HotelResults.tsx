"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import HotelCard from "@/components/HotelCard";
import type { HotelOffer } from "@/lib/hotels";

const HotelMap = dynamic(() => import("@/components/HotelMap"), {
  ssr: false,
  loading: () => <div className="map-wrap map-loading" aria-hidden="true" />,
});

type Chip = { id: string; label: string; test: (h: HotelOffer) => boolean };

const CHIPS: Chip[] = [
  { id: "rate45", label: "Note 4,5 et plus", test: (h) => h.rating >= 4.5 },
  { id: "cancel", label: "Annulation gratuite", test: (h) => h.freeCancel },
  { id: "breakfast", label: "Petit-déjeuner inclus", test: (h) => h.breakfast },
  { id: "pool", label: "Piscine", test: (h) => h.amenities.includes("Piscine") },
  { id: "wifi", label: "Wifi", test: (h) => h.amenities.includes("Wifi") },
  { id: "parking", label: "Parking", test: (h) => h.amenities.includes("Parking") },
  { id: "ac", label: "Climatisation", test: (h) => h.amenities.includes("Climatisation") },
  { id: "spa", label: "Spa", test: (h) => h.amenities.includes("Spa") },
  { id: "s4", label: "4 étoiles et plus", test: (h) => h.stars >= 4 },
  { id: "lt100", label: "Moins de 100 € / nuit", test: (h) => h.pricePerNight < 100 },
  { id: "near", label: "À moins de 2 km du centre", test: (h) => h.distanceKm < 2 },
];

export default function HotelResults({
  hotels,
  center,
  title,
  demo,
  savedSlugs,
  query,
}: {
  hotels: HotelOffer[];
  center: { lat: number; lng: number };
  title: string;
  demo: boolean;
  savedSlugs: string[];
  /** Paramètres de recherche à propager vers la fiche hôtel. */
  query: string;
}) {
  const [active, setActive] = useState<Set<string>>(() => new Set());
  const [hoverId, setHoverId] = useState<string | null>(null);
  const saved = useMemo(() => new Set(savedSlugs), [savedSlugs]);

  const toggle = (id: string) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const visible = hotels.filter((h) => CHIPS.every((c) => !active.has(c.id) || c.test(h)));
  const avg = hotels.length ? Math.round(hotels.reduce((s, h) => s + h.total, 0) / hotels.length) : 0;

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
            {CHIPS.map((c) => (
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
            {title} : {visible.length} hôtel{visible.length > 1 ? "s" : ""}
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
              <p>Aucun hôtel ne correspond à ces filtres.</p>
              <button type="button" className="empty-cta" onClick={() => setActive(new Set())}>
                Effacer les filtres
              </button>
            </div>
          ) : (
            <div className="res-grid">
              {visible.map((h) => (
                <HotelCard
                  key={h.id}
                  hotel={h}
                  href={`/hotel/${encodeURIComponent(h.id)}?${query}`}
                  avg={avg}
                  saved={saved.has(`hotel-${h.id}`)}
                  active={h.id === hoverId}
                  onHover={setHoverId}
                />
              ))}
            </div>
          )}

          <p className="affiliate-note">
            Wanderoo peut toucher une commission si vous réservez via un partenaire. Le prix que vous payez reste identique.
          </p>
        </section>

        <aside className="res-side">
          <HotelMap hotels={visible} center={center} activeId={hoverId} onHover={setHoverId} />
        </aside>
      </main>
    </>
  );
}
