"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleFavorite } from "@/app/actions/favorites";
import type { Destination } from "@/data/destinations";

export default function DestinationCard({
  d,
  saved: initialSaved = false,
}: {
  d: Destination;
  saved?: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [, startTransition] = useTransition();

  function onHeart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !saved;
    setSaved(next);
    startTransition(async () => {
      const res = await toggleFavorite({ slug: d.slug, label: d.city, imageUrl: d.image });
      if ("error" in res) {
        setSaved(!next);
        router.push("/connexion");
      } else {
        setSaved(res.saved);
      }
    });
  }

  return (
    <article className="card">
      <div className="card-img">
        <Image src={d.image} alt={d.city} fill sizes="193px" />
        {d.badge ? <span className="badge">{d.badge}</span> : null}
        <button
          className="heart"
          aria-label={saved ? "Retirer des favoris" : "Enregistrer"}
          aria-pressed={saved}
          onClick={onHeart}
        >
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path d="M16 28c7-4.7 12-8.7 12-15.3A6.7 6.7 0 0 0 21.3 6c-2.2 0-4.1 1.2-5.3 3-1.2-1.8-3.1-3-5.3-3A6.7 6.7 0 0 0 4 12.7C4 19.3 9 23.3 16 28Z" />
          </svg>
        </button>
      </div>
      <div className="card-body">
        <div className="ct">{d.title}</div>
        <div className="cs">{d.line2}</div>
        <div className="cp">
          {d.price}
          <span className="dot">·</span>
          <svg className="star" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2l2.9 6.3 6.8.6-5.1 4.5 1.5 6.7L12 17.8 5.9 20.6l1.5-6.7L2.3 8.9l6.8-.6z" />
          </svg>
          {d.rating}
        </div>
      </div>
    </article>
  );
}
