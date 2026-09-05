import CreateAlertButton from "@/components/CreateAlertButton";
import Header from "@/components/Header";
import OfferRow from "@/components/OfferRow";
import { cityName } from "@/lib/format";
import { searchFlights } from "@/lib/travelpayouts";

type SP = Record<string, string | string[] | undefined>;

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function frDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(d);
}

export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const type = one(sp.type) ?? "vol";
  const from = (one(sp.from) ?? "PAR").toUpperCase();
  const to = (one(sp.to) ?? "LIS").toUpperCase();
  const depart = one(sp.depart) ?? "2026-03-12";
  const ret = one(sp.return);
  const pax = Number(one(sp.pax) ?? "1") || 1;

  const dateLabel = [frDate(depart), frDate(ret)].filter(Boolean).join(" – ");
  const paxLabel = `${pax} voyageur${pax > 1 ? "s" : ""}`;

  return (
    <>
      <Header />
      <main className="wrap results-wrap">
        <div className="results-head">
          <h1>
            {cityName(from)} <span className="arw">→</span> {cityName(to)}
          </h1>
          <p className="results-meta">
            {dateLabel ? `${dateLabel} · ` : ""}
            {paxLabel}
          </p>
        </div>

        {type !== "vol" ? (
          <div className="soon">
            <h2>Bientôt disponible</h2>
            <p>
              La comparaison {type === "hotel" ? "d'hôtels" : "de voitures"} arrive
              très vite. Pour l&apos;instant, seuls les vols sont comparés.
            </p>
          </div>
        ) : (
          <FlightResults from={from} to={to} depart={depart} ret={ret} pax={pax} />
        )}
      </main>
    </>
  );
}

async function FlightResults({
  from,
  to,
  depart,
  ret,
  pax,
}: {
  from: string;
  to: string;
  depart: string;
  ret?: string;
  pax: number;
}) {
  const { offers, source } = await searchFlights({
    from,
    to,
    depart,
    return: ret,
    passengers: pax,
  });

  return (
    <>
      <div className="results-bar">
        <span className="results-count">
          {offers.length} offre{offers.length > 1 ? "s" : ""} · triées par prix
        </span>
        {source === "mock" ? (
          <span className="results-demo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8h.01M11 12h1v4h1" />
            </svg>
            Données de démonstration — ajoutez un token Travelpayouts pour les vrais prix
          </span>
        ) : null}
        <CreateAlertButton type="vol" from={from} to={to} bestPrice={offers[0]?.price} />
      </div>

      <div className="offers">
        {offers.map((o, i) => (
          <OfferRow key={o.id} offer={o} best={i === 0} />
        ))}
      </div>

      <p className="affiliate-note">
        Wanderoo peut toucher une commission si vous réservez via un partenaire. Le
        prix que vous payez reste identique.
      </p>
    </>
  );
}
