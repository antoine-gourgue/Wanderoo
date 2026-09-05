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
        {imageUrl ? (
          <Image src={imageUrl} alt={label} fill sizes="(max-width:640px) 50vw, 300px" />
        ) : null}
        <button
          className="heart"
          aria-pressed={true}
          aria-label="Retirer des favoris"
          onClick={remove}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 20.5 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 1 1 19.4 13z" />
          </svg>
        </button>
      </div>
      <div className="card-body">
        <div className="card-row">
          <span className="ct">{label}</span>
        </div>
      </div>
    </article>
  );
}
