"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { toggleFavorite } from "@/app/actions/favorites";

export default function FavoriteCard({
  slug,
  label,
  imageUrl,
}: {
  slug: string;
  label: string;
  imageUrl: string | null;
}) {
  const [removed, setRemoved] = useState(false);
  const [, startTransition] = useTransition();

  if (removed) return null;

  function remove() {
    setRemoved(true);
    startTransition(async () => {
      await toggleFavorite({ slug, label, imageUrl: imageUrl ?? undefined });
    });
  }

  return (
    <article className="card">
      <div className="card-img">
        {imageUrl ? <Image src={imageUrl} alt={label} fill sizes="193px" /> : null}
        <button className="heart" aria-pressed={true} aria-label="Retirer des favoris" onClick={remove}>
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path d="M16 28c7-4.7 12-8.7 12-15.3A6.7 6.7 0 0 0 21.3 6c-2.2 0-4.1 1.2-5.3 3-1.2-1.8-3.1-3-5.3-3A6.7 6.7 0 0 0 4 12.7C4 19.3 9 23.3 16 28Z" />
          </svg>
        </button>
      </div>
      <div className="card-body">
        <div className="ct">{label}</div>
        <div className="cs">Enregistré dans vos favoris</div>
      </div>
    </article>
  );
}
