"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleFavorite } from "@/app/actions/favorites";

export default function SaveButton({
  slug,
  label,
  imageUrl,
  saved: initialSaved = false,
}: {
  slug: string;
  label: string;
  imageUrl?: string;
  saved?: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [, startTransition] = useTransition();

  function onClick() {
    const next = !saved;
    setSaved(next);
    startTransition(async () => {
      const res = await toggleFavorite({ slug, label, imageUrl });
      if ("error" in res) {
        setSaved(!next);
        router.push("/connexion");
      } else {
        setSaved(res.saved);
      }
    });
  }

  return (
    <button type="button" className="lst-action" onClick={onClick} aria-pressed={saved}>
      <svg viewBox="0 0 32 32" className={saved ? "on" : ""} aria-hidden="true">
        <path d="M16 28c7-4.7 12-8.7 12-15.3A6.7 6.7 0 0 0 21.3 6c-2.2 0-4.1 1.2-5.3 3-1.2-1.8-3.1-3-5.3-3A6.7 6.7 0 0 0 4 12.7C4 19.3 9 23.3 16 28Z" />
      </svg>
      {saved ? "Enregistré" : "Enregistrer"}
    </button>
  );
}
