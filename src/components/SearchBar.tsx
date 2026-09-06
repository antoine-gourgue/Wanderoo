"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Place } from "@/app/api/places/route";

type TabKey = "vol" | "hotel" | "car";
type Field = "origin" | "destination" | "dates" | "pax";

const LABELS: Record<TabKey, Record<Field, string>> = {
  vol: { origin: "Vol depuis", destination: "Destination", dates: "Dates", pax: "Voyageurs" },
  hotel: { origin: "Destination", destination: "Quartier", dates: "Séjour", pax: "Voyageurs" },
  car: { origin: "Prise en charge", destination: "Restitution", dates: "Dates", pax: "Conducteur" },
};

const POPULAR: Place[] = [
  { code: "PAR", name: "Paris", country: "France", type: "city" },
  { code: "LIS", name: "Lisbonne", country: "Portugal", type: "city" },
  { code: "BCN", name: "Barcelone", country: "Espagne", type: "city" },
  { code: "NYC", name: "New York", country: "États-Unis", type: "city" },
  { code: "FCO", name: "Rome", country: "Italie", type: "city" },
  { code: "LON", name: "Londres", country: "Royaume-Uni", type: "city" },
];

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function frShort(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00Z`);
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" }).format(d);
}

export default function SearchBar({ tab }: { tab: TabKey }) {
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);

  const [origin, setOrigin] = useState<Place | null>(POPULAR[0]);
  const [destination, setDestination] = useState<Place | null>(null);
  const [depart, setDepart] = useState(todayPlus(21));
  const [ret, setRet] = useState(todayPlus(25));
  const [pax, setPax] = useState(1);

  const [open, setOpen] = useState<Field | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const labels = LABELS[tab];

  // Autocomplétion (debounce)
  useEffect(() => {
    if (open !== "origin" && open !== "destination") return;
    const term = query.trim();
    if (term.length < 2) {
      setResults(POPULAR);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = (await fetch(`/api/places?q=${encodeURIComponent(term)}`).then((r) => r.json())) as Place[];
        setResults(res);
      } catch {
        setResults([]);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [query, open]);

  // Fermer au clic extérieur
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(null);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function openField(f: Field) {
    setOpen(f);
    if (f === "origin" || f === "destination") {
      setQuery("");
      setResults(POPULAR);
    }
  }

  function pick(place: Place) {
    if (open === "origin") {
      setOrigin(place);
      openField("destination");
    } else {
      setDestination(place);
      setOpen(null);
    }
  }

  function submit() {
    if (!origin) return openField("origin");
    if (!destination) return openField("destination");
    const params = new URLSearchParams({
      type: tab,
      from: origin.code,
      to: destination.code,
      fromName: origin.name,
      toName: destination.name,
      depart,
      return: ret,
      pax: String(pax),
    });
    setOpen(null);
    router.push(`/recherche?${params.toString()}`);
  }

  const segVal = (place: Place | null, placeholder: string) =>
    place ? (
      <span className="sv">
        {place.name} <span style={{ color: "var(--rausch)" }}>{place.code}</span>
      </span>
    ) : (
      <span className="sv ph">{placeholder}</span>
    );

  return (
    <div className="searchbar-wrap" ref={wrapRef}>
      <div className="searchpill" role="search">
        <button className={`seg${open === "origin" ? " active" : ""}`} onClick={() => openField("origin")} type="button">
          <span className="sl">{labels.origin}</span>
          {segVal(origin, "Ville ou aéroport")}
        </button>
        <span className="sdiv" />
        <button className={`seg${open === "destination" ? " active" : ""}`} onClick={() => openField("destination")} type="button">
          <span className="sl">{labels.destination}</span>
          {segVal(destination, "Où allez-vous ?")}
        </button>
        <span className="sdiv" />
        <button className={`seg${open === "dates" ? " active" : ""}`} onClick={() => openField("dates")} type="button">
          <span className="sl">{labels.dates}</span>
          <span className="sv">
            {frShort(depart)} <span style={{ color: "var(--text-3)" }}>–</span> {frShort(ret)}
          </span>
        </button>
        <span className="sdiv" />
        <div className="seg go">
          <button className={`seg-inner${open === "pax" ? " active" : ""}`} onClick={() => openField("pax")} type="button">
            <span className="sl">{labels.pax}</span>
            <span className="sv">
              {pax} {tab === "car" ? "conducteur" : pax > 1 ? "voyageurs" : "voyageur"}
            </span>
          </button>
          <button className="go-btn" aria-label="Rechercher" onClick={submit} type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.2-3.2" />
            </svg>
            Rechercher
          </button>
        </div>
      </div>

      {open === "origin" || open === "destination" ? (
        <div className="pop pop-place">
          <input
            className="pop-input"
            autoFocus
            placeholder="Rechercher une ville…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <ul className="pop-list">
            {results.length === 0 ? (
              <li className="pop-empty">Aucun résultat</li>
            ) : (
              results.map((p) => (
                <li key={`${p.code}-${p.name}`}>
                  <button type="button" className="pop-item" onClick={() => pick(p)}>
                    <span className="pop-pin" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11Z" />
                        <circle cx="12" cy="10" r="2.5" />
                      </svg>
                    </span>
                    <span className="pop-text">
                      <b>{p.name}</b>
                      <small>{p.country}</small>
                    </span>
                    <span className="pop-code">{p.code}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}

      {open === "dates" ? (
        <div className="pop pop-dates">
          <label className="pop-field">
            <span>Aller</span>
            <input type="date" value={depart} min={todayPlus(0)} onChange={(e) => setDepart(e.target.value)} />
          </label>
          <label className="pop-field">
            <span>Retour</span>
            <input type="date" value={ret} min={depart} onChange={(e) => setRet(e.target.value)} />
          </label>
          <button type="button" className="pop-done" onClick={() => setOpen(null)}>
            Valider
          </button>
        </div>
      ) : null}

      {open === "pax" ? (
        <div className="pop pop-pax">
          <div className="pax-row">
            <div>
              <b>{tab === "car" ? "Conducteurs" : "Voyageurs"}</b>
              <small>Âge 18 et +</small>
            </div>
            <div className="stepper">
              <button type="button" onClick={() => setPax((p) => Math.max(1, p - 1))} disabled={pax <= 1} aria-label="Moins">
                −
              </button>
              <span>{pax}</span>
              <button type="button" onClick={() => setPax((p) => Math.min(9, p + 1))} disabled={pax >= 9} aria-label="Plus">
                +
              </button>
            </div>
          </div>
          <button type="button" className="pop-done" onClick={() => setOpen(null)}>
            Valider
          </button>
        </div>
      ) : null}
    </div>
  );
}
