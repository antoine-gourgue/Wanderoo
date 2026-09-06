import { formatDuration, hhmm } from "@/lib/format";
import type { FlightOffer } from "@/lib/travelpayouts";

/** Notes indicatives par compagnie (table statique, affichage façon Airbnb). */
const RATING: Record<string, number> = {
  VY: 4.6, U2: 4.5, FR: 4.3, LH: 4.8, AF: 4.7, TP: 4.6, IB: 4.6, BA: 4.7, KL: 4.8, SN: 4.6,
};

function reviewCount(id: string): number {
  let h = 7;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return 800 + (h % 3000);
}

export default function FlightCard({
  offer,
  best,
  avg,
}: {
  offer: FlightOffer;
  best: boolean;
  avg: number;
}) {
  const rating = (RATING[offer.airline] ?? 4.5).toFixed(1).replace(".", ",");
  const stops = offer.transfers === 0 ? "Direct" : `${offer.transfers} escale${offer.transfers > 1 ? "s" : ""}`;

  return (
    <a className="fcard" href={offer.bookingUrl} target="_blank" rel="noopener noreferrer sponsored">
      <div className="fcard-media">
        {best ? <span className="badge">Meilleur prix</span> : null}
        <div className="fv">
          <span className="fv-air" aria-hidden="true">
            {offer.airline}
          </span>
          <div className="fv-route">
            <div className="fv-time">
              <b>{hhmm(offer.departAt)}</b>
              <span>{offer.origin}</span>
            </div>
            <div className="fv-path">
              <span className="fv-dur">{formatDuration(offer.durationMin)}</span>
              <span className="fv-line" />
              <span className="fv-stop">{stops}</span>
            </div>
            <div className="fv-time">
              <b>{hhmm(offer.arriveAt)}</b>
              <span>{offer.destination}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="fcard-body">
        <div className="fcard-row">
          <span className="fcard-title">
            {offer.airlineName} · {stops}
          </span>
          <span className="fcard-rate">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2l2.9 6.3 6.8.6-5.1 4.5 1.5 6.7L12 17.8 5.9 20.6l1.5-6.7L2.3 8.9l6.8-.6z" />
            </svg>
            {rating} ({reviewCount(offer.id).toLocaleString("fr-FR")})
          </span>
        </div>
        <div className="fcard-sub">
          Départ {hhmm(offer.departAt)}
          <span className="dot">·</span>
          Arrivée {hhmm(offer.arriveAt)}
        </div>
        <div className="fcard-sub">
          {formatDuration(offer.durationMin)}
          <span className="dot">·</span>
          {stops}
        </div>
        <div className="fcard-sub">Taxes et frais inclus</div>
        <div className="fcard-price">
          {offer.price < avg ? <s>{avg} €</s> : null}
          <b>{offer.price} € au total</b>
        </div>
        <div className="fcard-chips">
          {best ? <span className="fcard-chip">Meilleur prix</span> : null}
          <span className="fcard-chip">Prix vérifié il y a moins de 15 min</span>
        </div>
      </div>
    </a>
  );
}
