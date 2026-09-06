"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleFavorite } from "@/app/actions/favorites";
import CarIllustration, { CATEGORY_TINT } from "@/components/CarIllustration";
import type { CarOffer } from "@/lib/cars";

export default function CarCard({ car, saved: initialSaved = false }: { car: CarOffer; saved?: boolean }) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [, startTransition] = useTransition();

  function onHeart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !saved;
    setSaved(next);
    startTransition(async () => {
      const res = await toggleFavorite({ slug: `car-${car.id}`, label: `${car.model} — ${car.supplier}` });
      if ("error" in res) {
        setSaved(!next);
        router.push("/connexion");
      } else {
        setSaved(res.saved);
      }
    });
  }

  const rating = car.rating.toFixed(1).replace(".", ",");

  return (
    <a className="ccard" href={car.bookingUrl} target="_blank" rel="noopener noreferrer sponsored">
      <div className="ccard-media" style={{ background: CATEGORY_TINT[car.category] }}>
        <CarIllustration category={car.category} className="ccard-ill" />
        <button className="heart" aria-label={saved ? "Retirer des favoris" : "Enregistrer"} aria-pressed={saved} onClick={onHeart}>
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path d="M16 28c7-4.7 12-8.7 12-15.3A6.7 6.7 0 0 0 21.3 6c-2.2 0-4.1 1.2-5.3 3-1.2-1.8-3.1-3-5.3-3A6.7 6.7 0 0 0 4 12.7C4 19.3 9 23.3 16 28Z" />
          </svg>
        </button>
      </div>
      <div className="ccard-body">
        <div className="cc-title">{car.model}</div>
        <div className="cc-sub">
          {car.category}
          <span className="dot">·</span>
          {car.transmission}
          <span className="dot">·</span>
          {car.seats} places
        </div>
        <div className="cc-sub">
          <svg className="cc-star" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2l2.9 6.3 6.8.6-5.1 4.5 1.5 6.7L12 17.8 5.9 20.6l1.5-6.7L2.3 8.9l6.8-.6z" />
          </svg>
          {rating}
          <span className="dot">·</span>
          {car.reviews} évaluations
          <span className="dot">·</span>
          {car.supplier}
        </div>
        <div className="cc-price">
          À partir de <b>{car.pricePerDay} €</b> par jour
        </div>
      </div>
    </a>
  );
}
