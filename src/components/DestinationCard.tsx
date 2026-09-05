"use client";

import Image from "next/image";
import { useState } from "react";
import type { Destination } from "@/data/destinations";

const CARD_SIZES =
  "(max-width:560px) 50vw, (max-width:860px) 50vw, (max-width:1120px) 33vw, 320px";

export default function DestinationCard({ d }: { d: Destination }) {
  const [saved, setSaved] = useState(false);

  return (
    <article className="card">
      <div className="card-img">
        <Image src={d.image} alt={d.city} fill sizes={CARD_SIZES} />
        <button
          className="heart"
          aria-label={saved ? "Retirer des favoris" : "Enregistrer"}
          aria-pressed={saved}
          onClick={(e) => {
            e.stopPropagation();
            setSaved((s) => !s);
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 20.5 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 1 1 19.4 13z" />
          </svg>
        </button>
        {d.badge ? <span className="badge">{d.badge}</span> : null}
        <div className="dots" aria-hidden="true">
          <i className="on" />
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>
      <div className="card-body">
        <div className="card-row">
          <span className="ct">{d.city}</span>
          <span className="rate">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2l2.9 6.3 6.8.6-5.1 4.5 1.5 6.7L12 17.8 5.9 20.6l1.5-6.7L2.3 8.9l6.8-.6z" />
            </svg>
            {d.rating}
          </span>
        </div>
        <div className="cs">{d.sub}</div>
        <div className="cd">{d.dates}</div>
        <div className="cp">
          <b>{d.price}</b> {d.priceUnit}
        </div>
      </div>
    </article>
  );
}
