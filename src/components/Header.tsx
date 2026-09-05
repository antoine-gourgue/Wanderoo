"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type TabKey = "vol" | "hotel" | "car";
type Seg = { label: string; value: string; placeholder?: boolean };

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  {
    key: "vol",
    label: "Vols",
    icon: (
      <path d="M17.8 19.2 16 11l3.5-3.5a2.1 2.1 0 0 0-3-3L13 8 4.8 6.2a1 1 0 0 0-.9 1.7l5.6 3.6-2.3 4.2-2.7-.3-1 1 3.5 2 2 3.5 1-1-.3-2.7 4.2-2.3 3.6 5.6a1 1 0 0 0 1.7-.9Z" />
    ),
  },
  {
    key: "hotel",
    label: "Hôtels",
    icon: <path d="M3 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M14 9h6a1 1 0 0 1 1 1v11M3 21h18M7 8h2M7 12h2" />,
  },
  {
    key: "car",
    label: "Voiture",
    icon: (
      <path d="M5 17h14M5 17a2 2 0 1 1-4 0M23 17a2 2 0 1 1-4 0M4 12l1.5-4.5A2 2 0 0 1 7.4 6h9.2a2 2 0 0 1 1.9 1.5L20 12M4 12h16" />
    ),
  },
];

const PRESETS: Record<TabKey, Seg[]> = {
  vol: [
    { label: "Vol depuis", value: "Paris" },
    { label: "Destination", value: "Lisbonne" },
    { label: "Dates", value: "12 – 16 mars", placeholder: true },
    { label: "Voyageurs", value: "1 adulte", placeholder: true },
  ],
  hotel: [
    { label: "Destination", value: "Lisbonne" },
    { label: "Arrivée", value: "12 mars" },
    { label: "Départ", value: "16 mars" },
    { label: "Voyageurs", value: "2 adultes · 1 chambre", placeholder: true },
  ],
  car: [
    { label: "Prise en charge", value: "Aéroport de Lisbonne" },
    { label: "Restitution", value: "Même agence" },
    { label: "Dates", value: "12 – 16 mars", placeholder: true },
    { label: "Âge", value: "25 ans et +", placeholder: true },
  ],
};

const ROUTE: Record<TabKey, Record<string, string>> = {
  vol: { type: "vol", from: "PAR", to: "LIS", depart: "2026-03-12", return: "2026-03-16", pax: "1" },
  hotel: { type: "hotel", to: "LIS", depart: "2026-03-12", return: "2026-03-16", pax: "2" },
  car: { type: "car", from: "LIS", depart: "2026-03-12", return: "2026-03-16", pax: "1" },
};

const TabIcon = ({ children }: { children: React.ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const SearchIcon = ({ width = 3 }: { width?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </svg>
);

export default function Header() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("vol");
  const [shrink, setShrink] = useState(false);

  const goSearch = () => {
    const q = new URLSearchParams(ROUTE[tab]).toString();
    router.push(`/recherche?${q}`);
  };

  useEffect(() => {
    let shrunk = false;
    const onScroll = () => {
      const y = window.scrollY;
      if (!shrunk && y > 90) {
        shrunk = true;
        setShrink(true);
      } else if (shrunk && y < 30) {
        shrunk = false;
        setShrink(false);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const segs = PRESETS[tab];

  return (
    <header id="hdr" className={shrink ? "shrink" : undefined}>
      <div className="wrap hdr-main">
        <a className="logo" href="#" aria-label="Wanderoo, accueil">
          <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path
              d="M16 2c-5 0-9 3.9-9 9 0 6.2 7.4 12.9 8.4 13.7a.9.9 0 0 0 1.2 0C17.6 23.9 25 17.2 25 11c0-5.1-4-9-9-9Z"
              fill="var(--rausch)"
            />
            <circle cx="16" cy="11" r="3.4" fill="#fff" />
          </svg>
          <span className="word">wanderoo</span>
        </a>

        <div className="tabs" role="tablist" aria-label="Type de recherche">
          {TABS.map((t) => (
            <button
              key={t.key}
              className="tab"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
            >
              <TabIcon>{t.icon}</TabIcon>
              {t.label}
            </button>
          ))}
        </div>

        <div className="hdr-right">
          <a className="hlink" href="#">
            Aide
          </a>
          <button className="iconround" aria-label="Langue et région">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
            </svg>
          </button>
          <button className="profile" aria-label="Menu du profil">
            <span className="burger" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="ava" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.6-8 6v2h16v-2c0-3.4-3.6-6-8-6Z" />
              </svg>
            </span>
          </button>
        </div>

        <div className="compact">
          <button className="compact-pill" onClick={goSearch}>
            <span className="cp">{TABS.find((t) => t.key === tab)?.label}</span>
            <span className="cp sub">{segs[1].value}</span>
            <span className="cp sub">{segs[2].label}</span>
            <span className="cp sub">{segs[3].label}</span>
            <span className="cp-go">
              <SearchIcon />
            </span>
          </button>
        </div>
      </div>

      <div className="wrap hdr-search">
        <div className="searchpill" role="search">
          <div className="seg" tabIndex={0}>
            <span className="sl">{segs[0].label}</span>
            <span className={`sv${segs[0].placeholder ? " ph" : ""}`}>{segs[0].value}</span>
          </div>
          <span className="sdiv" />
          <div className="seg" tabIndex={0}>
            <span className="sl">{segs[1].label}</span>
            <span className={`sv${segs[1].placeholder ? " ph" : ""}`}>{segs[1].value}</span>
          </div>
          <span className="sdiv" />
          <div className="seg" tabIndex={0}>
            <span className="sl">{segs[2].label}</span>
            <span className={`sv${segs[2].placeholder ? " ph" : ""}`}>{segs[2].value}</span>
          </div>
          <span className="sdiv" />
          <div className="seg go" tabIndex={0}>
            <div className="seg-inner">
              <span className="sl">{segs[3].label}</span>
              <span className={`sv${segs[3].placeholder ? " ph" : ""}`}>{segs[3].value}</span>
            </div>
            <button className="go-btn" aria-label="Rechercher" onClick={goSearch}>
              <SearchIcon />
              Rechercher
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
