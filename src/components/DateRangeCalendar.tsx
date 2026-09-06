"use client";

import { useState } from "react";

type Props = {
  start: string; // ISO YYYY-MM-DD ou ""
  end: string;
  onChange: (start: string, end: string) => void;
};

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
const FLEX_OPTIONS = [0, 1, 2, 3, 7, 14];

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function monthLabel(y: number, m: number): string {
  const s = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(new Date(y, m, 1));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Cases du mois : null = case vide avant le 1er (semaine commençant le lundi). */
function buildMonth(y: number, m: number): (string | null)[] {
  const lead = (new Date(y, m, 1).getDay() + 6) % 7;
  const count = new Date(y, m + 1, 0).getDate();
  const cells: (string | null)[] = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= count; d++) cells.push(iso(new Date(y, m, d)));
  return cells;
}

export default function DateRangeCalendar({ start, end, onChange }: Props) {
  const now = new Date();
  const today = iso(now);
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [hover, setHover] = useState<string | null>(null);
  const [flex, setFlex] = useState(0);

  const canPrev = view.y > now.getFullYear() || (view.y === now.getFullYear() && view.m > now.getMonth());
  const shift = (n: number) =>
    setView((v) => {
      const d = new Date(v.y, v.m + n, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  function pickDay(d: string) {
    if (!start || end) return onChange(d, ""); // nouvelle sélection
    if (d <= start) return onChange(d, ""); // avant le départ : on recommence
    onChange(start, d);
  }

  const rangeEnd = end || (start && hover && hover > start ? hover : "");
  const months = [0, 1].map((i) => {
    const dt = new Date(view.y, view.m + i, 1);
    return { y: dt.getFullYear(), m: dt.getMonth() };
  });

  return (
    <div className="cal">
      <div className="cal-toggle" role="tablist" aria-label="Type de dates">
        <button type="button" className="cal-tab on" role="tab" aria-selected={true}>
          Dates
        </button>
        <button type="button" className="cal-tab" role="tab" aria-selected={false}>
          Flexible
        </button>
      </div>

      <div className="cal-months">
        {months.map(({ y, m }, i) => (
          <div className="cal-month" key={`${y}-${m}`}>
            <div className="cal-head">
              {i === 0 ? (
                <button type="button" className="chev" onClick={() => shift(-1)} disabled={!canPrev} aria-label="Mois précédent">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m15 6-6 6 6 6" />
                  </svg>
                </button>
              ) : (
                <span className="chev-ph" />
              )}
              <h2 className="cal-title">{monthLabel(y, m)}</h2>
              {i === 1 ? (
                <button type="button" className="chev" onClick={() => shift(1)} aria-label="Mois suivant">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </button>
              ) : (
                <span className="chev-ph" />
              )}
            </div>
            <div className="cal-week" aria-hidden="true">
              {WEEKDAYS.map((w, k) => (
                <span key={k}>{w}</span>
              ))}
            </div>
            <div className="cal-grid" role="grid">
              {buildMonth(y, m).map((d, k) => {
                if (d === null) return <span key={`e${k}`} className="cal-empty" />;
                const disabled = d < today;
                const cls = [
                  "cal-day",
                  d === start ? "is-start" : "",
                  d === end ? "is-end" : "",
                  start && rangeEnd && d > start && d < rangeEnd ? "in-range" : "",
                  !end && d === rangeEnd && d !== start ? "is-end tentative" : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <button
                    key={d}
                    type="button"
                    className={cls}
                    disabled={disabled}
                    onClick={() => pickDay(d)}
                    onMouseEnter={() => setHover(d)}
                    onMouseLeave={() => setHover(null)}
                    aria-label={`${Number(d.slice(-2))} ${monthLabel(y, m)}`}
                    aria-pressed={d === start || d === end}
                  >
                    <span>{Number(d.slice(-2))}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="cal-foot">
        <div className="cal-chips" role="radiogroup" aria-label="Flexibilité des dates">
          {FLEX_OPTIONS.map((n) => (
            <button
              type="button"
              key={n}
              role="radio"
              aria-checked={flex === n}
              className={`chip${flex === n ? " on" : ""}`}
              onClick={() => setFlex(n)}
            >
              {n === 0 ? (
                "Dates exactes"
              ) : (
                <>
                  <span aria-hidden="true">±</span> {n} jour{n > 1 ? "s" : ""}
                </>
              )}
            </button>
          ))}
        </div>
        {start ? (
          <button type="button" className="cal-clear" onClick={() => onChange("", "")}>
            Effacer les dates
          </button>
        ) : null}
      </div>
    </div>
  );
}
