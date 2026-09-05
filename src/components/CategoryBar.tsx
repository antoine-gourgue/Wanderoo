"use client";

import { useState } from "react";

const CATS: { label: string; icon: React.ReactNode }[] = [
  { label: "Populaires", icon: <path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-1.5.6-2.8 1.3-3.8C9 10 12 9 12 6.5 13 8 14 9 14 11" /> },
  { label: "Bord de mer", icon: <path d="M3 18c2-2 4-2 6 0M15 18c2-2 4-2 6 0M4 14h16M12 4v10M12 4a5 5 0 0 1 5 5H7a5 5 0 0 1 5-5Z" /> },
  { label: "Montagne", icon: <><path d="m3 19 6-9 4 5 3-4 5 8Z" /><circle cx="17" cy="6" r="1.6" /></> },
  { label: "Ville", icon: <path d="M4 20V9l8-5 8 5v11M9 20v-6h6v6" /> },
  {
    label: "Soleil",
    icon: (
      <>
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4" />
      </>
    ),
  },
  { label: "Ski", icon: <path d="M12 2v20M12 2l4 4M12 2 8 6M2 12h20M2 12l4-4M2 12l4 4M22 12l-4-4M22 12l-4 4" /> },
  {
    label: "Road-trip",
    icon: <path d="M5 17h14M5 17a2 2 0 1 1-4 0M23 17a2 2 0 1 1-4 0M4 12l1.5-4.5A2 2 0 0 1 7.4 6h9.2a2 2 0 0 1 1.9 1.5L20 12M4 12h16" />,
  },
  { label: "Exotique", icon: <path d="M12 22c0-7 0-9 6-13-6 0-9 2-9 7M12 22c0-5-1-8-6-10 4-.5 6 .5 6 3" /> },
  { label: "Culture", icon: <path d="M5 21V10M19 21V10M4 10h16L12 3 4 10ZM9 21v-5h6v5" /> },
  { label: "Nature", icon: <path d="M12 22V8M12 8a4 4 0 1 1 4-4 4 4 0 0 1-4 4Zm0 0a4 4 0 1 0-4-4M7 22h10" /> },
];

export default function CategoryBar() {
  const [active, setActive] = useState(0);

  return (
    <div className="catbar">
      <div className="wrap catbar-inner">
        <div className="cats" role="tablist" aria-label="Catégories">
          {CATS.map((c, i) => (
            <button
              key={c.label}
              className="cat"
              role="tab"
              aria-selected={active === i}
              onClick={() => setActive(i)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {c.icon}
              </svg>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
        <button className="filters">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
            <path d="M3 6h18M6 12h12M10 18h4" />
          </svg>
          Filtres
        </button>
      </div>
    </div>
  );
}
