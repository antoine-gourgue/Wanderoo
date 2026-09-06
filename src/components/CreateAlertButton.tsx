"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createAlert } from "@/app/actions/alerts";

export default function CreateAlertButton({
  type,
  from,
  to,
  bestPrice,
}: {
  type: "vol" | "hotel" | "car";
  from?: string;
  to: string;
  bestPrice?: number;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "done" | "exists">("idle");
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const res = await createAlert({ type, origin: from, destination: to, lastPrice: bestPrice });
      if ("error" in res) {
        if (res.error === "auth") router.push("/connexion");
        else setState("exists");
      } else {
        setState("done");
      }
    });
  }

  const label =
    state === "done"
      ? "Alerte créée"
      : state === "exists"
        ? "Alerte déjà active"
        : "Créer une alerte prix";

  return (
    <button
      className="alert-btn"
      onClick={onClick}
      disabled={pending || state === "done"}
      aria-live="polite"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {state === "done" ? (
          <path d="M20 7 9.5 17.5 4 12" />
        ) : (
          <>
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </>
        )}
      </svg>
      {label}
    </button>
  );
}
