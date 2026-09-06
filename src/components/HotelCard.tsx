"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleFavorite } from "@/app/actions/favorites";
import type { HotelOffer } from "@/lib/hotels";

export default function HotelCard({
  hotel,
  href,
  avg,
  saved: initialSaved = false,
  active,
  onHover,
}: {
  hotel: HotelOffer;
  href: string;
  avg: number;
  saved?: boolean;
  active: boolean;
  onHover: (id: string | null) => void;
}) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [saved, setSaved] = useState(initialSaved);
  const [, startTransition] = useTransition();
  const n = hotel.images.length;

  function go(e: React.MouseEvent, dir: -1 | 1) {
    e.preventDefault();
    e.stopPropagation();
    setIdx((i) => (i + dir + n) % n);
  }

  function onHeart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !saved;
    setSaved(next);
    startTransition(async () => {
      const res = await toggleFavorite({ slug: `hotel-${hotel.id}`, label: hotel.name, imageUrl: hotel.images[0] });
      if ("error" in res) {
        setSaved(!next);
        router.push("/connexion");
      } else {
        setSaved(res.saved);
      }
    });
  }

  const rating = hotel.rating.toFixed(1).replace(".", ",");
  const stars = `${hotel.stars} étoile${hotel.stars > 1 ? "s" : ""}`;

  return (
    <a
      className={`hcard${active ? " active" : ""}`}
      href={href}
      onMouseEnter={() => onHover(hotel.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="hcard-media">
        <div className="hc-track" style={{ transform: `translateX(-${idx * 100}%)` }}>
          {hotel.images.map((src, i) => (
            <div className="hc-slide" key={src}>
              <Image src={src} alt={`${hotel.name} — photo ${i + 1}`} fill sizes="337px" />
            </div>
          ))}
        </div>
        {hotel.badge ? <span className="badge">{hotel.badge}</span> : null}
        <button className="heart" aria-label={saved ? "Retirer des favoris" : "Enregistrer"} aria-pressed={saved} onClick={onHeart}>
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path d="M16 28c7-4.7 12-8.7 12-15.3A6.7 6.7 0 0 0 21.3 6c-2.2 0-4.1 1.2-5.3 3-1.2-1.8-3.1-3-5.3-3A6.7 6.7 0 0 0 4 12.7C4 19.3 9 23.3 16 28Z" />
          </svg>
        </button>
        {n > 1 ? (
          <>
            <button className="hc-arrow prev" aria-label="Photo précédente" onClick={(e) => go(e, -1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m15 6-6 6 6 6" />
              </svg>
            </button>
            <button className="hc-arrow next" aria-label="Photo suivante" onClick={(e) => go(e, 1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
            <div className="hc-dots" aria-hidden="true">
              {hotel.images.map((_, i) => (
                <i key={i} className={i === idx ? "on" : ""} />
              ))}
            </div>
          </>
        ) : null}
      </div>

      <div className="fcard-body">
        <div className="fcard-row">
          <span className="fcard-title">Hôtel ⋅ {hotel.area}</span>
          <span className="fcard-rate">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2l2.9 6.3 6.8.6-5.1 4.5 1.5 6.7L12 17.8 5.9 20.6l1.5-6.7L2.3 8.9l6.8-.6z" />
            </svg>
            {rating} ({hotel.reviews.toLocaleString("fr-FR")})
          </span>
        </div>
        <div className="fcard-sub hc-name">{hotel.name}</div>
        <div className="fcard-sub">
          {stars}
          <span className="dot">·</span>
          {hotel.distanceKm} km du centre
        </div>
        <div className="fcard-sub">{hotel.breakfast ? "Petit-déjeuner inclus" : "Professionnel"}</div>
        <div className="fcard-price">
          {hotel.total < avg ? <s>{avg} €</s> : null}
          <b>{hotel.total} € au total</b>
        </div>
        <div className="fcard-chips">
          {hotel.freeCancel ? <span className="fcard-chip">Annulation gratuite</span> : null}
          <span className="fcard-chip">
            {hotel.pricePerNight} € / nuit · {hotel.nights} nuit{hotel.nights > 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </a>
  );
}
