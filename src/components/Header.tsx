"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import SearchBar, { type SearchInitial } from "@/components/SearchBar";

type TabKey = "all" | "vol" | "hotel" | "car";

/** Recherche en cours, affichée en pilule compacte (page de résultats, comme Airbnb). */
export type CompactSearch = {
  label: string;
  dates: string;
  pax: string;
  tab: Exclude<TabKey, "all">;
  initial: SearchInitial;
};

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  {
    key: "all",
    label: "Tout voir",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
      </>
    ),
  },
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

export default function Header({ compact }: { compact?: CompactSearch }) {
  const { data: session } = useSession();
  const [tab, setTab] = useState<TabKey>(compact?.tab ?? "all");
  const [expanded, setExpanded] = useState(!compact);

  const user = session?.user;
  const initial = (user?.name ?? user?.email ?? "?").charAt(0).toUpperCase();

  return (
    <header id="hdr" className={compact ? "compact" : undefined}>
      <div className="wrap hdr-main">
        <Link className="logo" href="/" aria-label="Wanderoo, accueil">
          <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path
              d="M16 2c-5 0-9 3.9-9 9 0 6.2 7.4 12.9 8.4 13.7a.9.9 0 0 0 1.2 0C17.6 23.9 25 17.2 25 11c0-5.1-4-9-9-9Z"
              fill="var(--rausch)"
            />
            <circle cx="16" cy="11" r="3.4" fill="#fff" />
          </svg>
          <span className="word">wanderoo</span>
        </Link>

        {compact && !expanded ? (
          <button className="mini-search" onClick={() => setExpanded(true)} aria-label="Modifier la recherche">
            <span className="mini-ic" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.8 19.2 16 11l3.5-3.5a2.1 2.1 0 0 0-3-3L13 8 4.8 6.2a1 1 0 0 0-.9 1.7l5.6 3.6-2.3 4.2-2.7-.3-1 1 3.5 2 2 3.5 1-1-.3-2.7 4.2-2.3 3.6 5.6a1 1 0 0 0 1.7-.9Z" />
              </svg>
            </span>
            <span className="mini-seg">{compact.label}</span>
            <span className="mini-div" aria-hidden="true" />
            <span className="mini-seg">{compact.dates}</span>
            <span className="mini-div" aria-hidden="true" />
            <span className="mini-seg light">{compact.pax}</span>
            <span className="mini-go" aria-hidden="true">
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="13.5" cy="13.5" r="9" />
                <path d="m27 27-6.6-6.6" />
              </svg>
            </span>
          </button>
        ) : (
          <nav className="tabs" role="tablist" aria-label="Type de recherche">
            {TABS.map((t) => (
              <button key={t.key} className="tab" role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}>
                <span className="tab-ic" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                    {t.icon}
                  </svg>
                </span>
                {t.label}
              </button>
            ))}
          </nav>
        )}

        <div className="hdr-right">
          <a className="hlink" href="#">
            Devenir partenaire
          </a>
          <button className="iconround" aria-label="Langue et région">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
            </svg>
          </button>
          <Link className="iconround menu" href={user ? "/compte" : "/connexion"} aria-label={user ? "Mon compte" : "Menu"}>
            {user ? (
              <b className="ava-init">{initial}</b>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </Link>
        </div>
      </div>

      {expanded ? (
        <div className="wrap hdr-search">
          <SearchBar tab={tab === "all" ? "vol" : tab} initial={compact?.initial} />
        </div>
      ) : null}
    </header>
  );
}
