"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Place } from "@/app/api/places/route";
import DateRangeCalendar from "@/components/DateRangeCalendar";

type TabKey = "vol" | "hotel" | "car";
type Field = "origin" | "destination" | "dates" | "pax";

const LABELS: Record<TabKey, Record<Field, string>> = {
  vol: { origin: "Départ", destination: "Destination", dates: "Dates", pax: "Voyageurs" },
  hotel: { origin: "Destination", destination: "Quartier", dates: "Séjour", pax: "Voyageurs" },
  car: { origin: "Prise en charge", destination: "Restitution", dates: "Dates", pax: "Conducteur" },
};

const POPULAR: (Place & { hint: string })[] = [
  { code: "PAR", name: "Paris, Île-de-France", country: "France", type: "city", hint: "Célèbre pour des sites comme : Tour Eiffel" },
  { code: "LIS", name: "Lisbonne, Portugal", country: "Portugal", type: "city", hint: "Destination idéale pour un week-end" },
  { code: "BCN", name: "Barcelone, Catalogne", country: "Espagne", type: "city", hint: "Destination balnéaire prisée" },
  { code: "FCO", name: "Rome, Latium", country: "Italie", type: "city", hint: "Célèbre pour des sites comme : Colisée" },
  { code: "NYC", name: "New York, État de New York", country: "États-Unis", type: "city", hint: "Populaire auprès des voyageurs" },
  { code: "LON", name: "Londres, Angleterre", country: "Royaume-Uni", type: "city", hint: "Célèbre pour des sites comme : Big Ben" },
];

function frShort(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00Z`);
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" }).format(d);
}

export type SearchInitial = {
  origin?: Place | null;
  destination?: Place | null;
  depart?: string;
  ret?: string;
  pax?: number;
};

export default function SearchBar({ tab, initial }: { tab: TabKey; initial?: SearchInitial }) {
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const segRefs = useRef<Partial<Record<Field, HTMLDivElement | null>>>({});

  const [origin, setOrigin] = useState<Place | null>(
    initial?.origin ?? { code: "PAR", name: "Paris", country: "France", type: "city" },
  );
  const [destination, setDestination] = useState<Place | null>(initial?.destination ?? null);
  const [depart, setDepart] = useState(initial?.depart ?? "");
  const [ret, setRet] = useState(initial?.ret ?? "");
  const [pax, setPax] = useState(initial?.pax ?? 1);

  const [open, setOpen] = useState<Field | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [popLeft, setPopLeft] = useState(0);
  const labels = LABELS[tab];

  // Autocomplétion (debounce)
  useEffect(() => {
    if (open !== "origin" && open !== "destination") return;
    const term = query.trim();
    if (term.length < 2) return; // la liste retombe sur POPULAR (dérivé de `query`)
    const t = setTimeout(async () => {
      try {
        const res = (await fetch(`/api/places?q=${encodeURIComponent(term)}`).then((r) => r.json())) as Place[];
        setResults(res);
      } catch {
        setResults([]);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query, open]);

  // Fermeture : clic extérieur / Échap
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function openField(f: Field) {
    if (open === f) return;
    setOpen(f);
    const seg = segRefs.current[f];
    if (seg) setPopLeft(seg.offsetLeft);
    if (f === "origin" || f === "destination") {
      setQuery("");
      setResults([]);
    }
  }

  function pick(place: Place) {
    if (open === "origin") {
      setOrigin(place);
      openField("destination");
    } else {
      setDestination(place);
      openField("dates");
    }
  }

  function submit() {
    if (!origin) return openField("origin");
    if (!destination) return openField("destination");
    if (!depart || !ret) return openField("dates");
    const params = new URLSearchParams({
      type: tab,
      from: origin.code,
      to: destination.code,
      fromName: origin.name.split(",")[0],
      toName: destination.name.split(",")[0],
      depart,
      return: ret,
      pax: String(pax),
    });
    setOpen(null);
    router.push(`/recherche?${params.toString()}`);
  }

  const isPlaceOpen = open === "origin" || open === "destination";
  const list = query.trim().length >= 2 ? results : POPULAR;

  const renderPlaceSeg = (field: "origin" | "destination", place: Place | null, placeholder: string) => (
    <div
      className={`seg${open === field ? " active" : ""}`}
      ref={(el) => {
        segRefs.current[field] = el;
      }}
      role="button"
      tabIndex={0}
      onClick={() => openField(field)}
      onKeyDown={(e) => e.key === "Enter" && openField(field)}
    >
      <span className="sl">{labels[field]}</span>
      {open === field ? (
        <input
          className="sv-input"
          autoFocus
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      ) : place ? (
        <span className="sv filled">{place.name.split(",")[0]}</span>
      ) : (
        <span className="sv">{placeholder}</span>
      )}
    </div>
  );

  return (
    <div className="searchbar-wrap" ref={wrapRef}>
      <div className={`searchpill${open ? " open" : ""}`} role="search">
        {renderPlaceSeg("origin", origin, "Rechercher une ville")}
        <span className="sdiv" />
        {renderPlaceSeg("destination", destination, "Rechercher une destination")}
        <span className="sdiv" />
        <div
          className={`seg${open === "dates" ? " active" : ""}`}
          ref={(el) => {
            segRefs.current.dates = el;
          }}
          role="button"
          tabIndex={0}
          onClick={() => openField("dates")}
          onKeyDown={(e) => e.key === "Enter" && openField("dates")}
        >
          <span className="sl">{labels.dates}</span>
          {depart ? (
            <span className="sv filled">
              {frShort(depart)} – {ret ? frShort(ret) : "?"}
            </span>
          ) : (
            <span className="sv">Quand ?</span>
          )}
          {depart && open === "dates" ? (
            <button
              type="button"
              className="seg-clear"
              aria-label="Effacer les dates"
              onClick={(e) => {
                e.stopPropagation();
                setDepart("");
                setRet("");
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          ) : null}
        </div>
        <span className="sdiv" />
        <div
          className={`seg last${open === "pax" ? " active" : ""}`}
          ref={(el) => {
            segRefs.current.pax = el;
          }}
          role="button"
          tabIndex={0}
          onClick={() => openField("pax")}
          onKeyDown={(e) => e.key === "Enter" && openField("pax")}
        >
          <span className="seg-text">
            <span className="sl">{labels.pax}</span>
            <span className={`sv${pax > 0 ? " filled" : ""}`}>
              {pax} {tab === "car" ? "conducteur" : pax > 1 ? "voyageurs" : "voyageur"}
            </span>
          </span>
          <button
            className={`go-btn${open ? " expanded" : ""}`}
            aria-label="Rechercher"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              submit();
            }}
          >
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="13.5" cy="13.5" r="9" />
              <path d="m27 27-6.6-6.6" />
            </svg>
            {open ? <span>Rechercher</span> : null}
          </button>
        </div>
      </div>

      {isPlaceOpen ? (
        <div className="pop pop-place" style={{ left: Math.min(popLeft, 850 - 425) }}>
          <div className="pop-title">{query.trim().length >= 2 ? "Résultats" : "Suggestions de destinations"}</div>
          <ul className="pop-list">
            {list.length === 0 ? (
              <li className="pop-empty">Aucun résultat pour « {query} »</li>
            ) : (
              list.map((p) => (
                <li key={`${p.code}-${p.name}`}>
                  <button type="button" className="pop-item" onClick={() => pick(p)}>
                    <span className="pop-ic" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11Z" />
                        <circle cx="12" cy="10" r="2.5" />
                      </svg>
                    </span>
                    <span className="pop-text">
                      <b>{p.name}</b>
                      <small>{"hint" in p ? (p as { hint: string }).hint : p.country}</small>
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}

      {open === "dates" ? (
        <div className="pop pop-dates">
          <DateRangeCalendar
            start={depart}
            end={ret}
            onChange={(s, e) => {
              setDepart(s);
              setRet(e);
              if (s && e) openField("pax");
            }}
          />
        </div>
      ) : null}

      {open === "pax" ? (
        <div className="pop pop-pax">
          <div className="pax-row">
            <div>
              <b>{tab === "car" ? "Conducteurs" : "Adultes"}</b>
              <small>{tab === "car" ? "25 ans et plus" : "13 ans et plus"}</small>
            </div>
            <div className="stepper">
              <button type="button" onClick={() => setPax((p) => Math.max(1, p - 1))} disabled={pax <= 1} aria-label="Retirer">
                −
              </button>
              <span>{pax}</span>
              <button type="button" onClick={() => setPax((p) => Math.min(9, p + 1))} disabled={pax >= 9} aria-label="Ajouter">
                +
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
