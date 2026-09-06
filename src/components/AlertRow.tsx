"use client";

import { useState, useTransition } from "react";
import { deleteAlert } from "@/app/actions/alerts";

export default function AlertRow({
  id,
  title,
  sub,
  price,
}: {
  id: string;
  title: string;
  sub: string;
  price?: number;
}) {
  const [removed, setRemoved] = useState(false);
  const [pending, startTransition] = useTransition();

  if (removed) return null;

  function remove() {
    setRemoved(true);
    startTransition(async () => {
      await deleteAlert(id);
    });
  }

  return (
    <div className="alert-row">
      <span className="alert-bell" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
      </span>
      <div className="alert-info">
        <div className="alert-title">{title}</div>
        <div className="alert-sub">{sub}</div>
      </div>
      {typeof price === "number" ? <div className="alert-price">dès {price}€</div> : null}
      <button className="alert-del" onClick={remove} disabled={pending}>
        Supprimer
      </button>
    </div>
  );
}
