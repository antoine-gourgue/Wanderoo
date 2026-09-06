import CreateAlertButton from "@/components/CreateAlertButton";

export default function RouteSidePanel({
  from,
  to,
  fromName,
  toName,
  dateLabel,
  paxLabel,
  best,
  avg,
  count,
  live,
}: {
  from: string;
  to: string;
  fromName: string;
  toName: string;
  dateLabel: string;
  paxLabel: string;
  best: number;
  avg: number;
  count: number;
  live: boolean;
}) {
  return (
    <div className="side-card">
      <div className="side-route">
        <div className="side-city">
          <b>{from}</b>
          <span>{fromName}</span>
        </div>
        <span className="side-arc" aria-hidden="true">
          <svg viewBox="0 0 160 36" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M4 32 C 50 -4, 110 -4, 156 32" strokeDasharray="2 7" />
            <path d="M156 32 l-8-3 M156 32 l-3-8" />
          </svg>
        </span>
        <div className="side-city">
          <b>{to}</b>
          <span>{toName}</span>
        </div>
      </div>

      <div className="side-meta">
        {dateLabel ? `${dateLabel} · ` : ""}
        {paxLabel}
      </div>

      <div className="side-stats">
        <div>
          <small>Meilleur prix</small>
          <b>{best} €</b>
        </div>
        <div>
          <small>Prix moyen</small>
          <b>{avg} €</b>
        </div>
        <div>
          <small>Offres</small>
          <b>{count}</b>
        </div>
      </div>

      <CreateAlertButton type="vol" from={from} to={to} bestPrice={best} />

      <p className="side-note">
        {live ? "Prix en direct, rafraîchis toutes les 15 minutes." : "Données de démonstration."} Wanderoo peut toucher une
        commission ; le prix reste identique pour vous.
      </p>
    </div>
  );
}
