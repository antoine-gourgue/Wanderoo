import type { FlightOffer } from "@/lib/travelpayouts";
import { formatDuration, hhmm } from "@/lib/format";

function stopsLabel(transfers: number): string {
  if (transfers === 0) return "Direct";
  return `${transfers} escale${transfers > 1 ? "s" : ""}`;
}

export default function OfferRow({
  offer,
  best,
}: {
  offer: FlightOffer;
  best?: boolean;
}) {
  return (
    <article className={`offer${best ? " best" : ""}`}>
      {best ? <span className="offer-flag">Meilleur prix</span> : null}

      <div className="offer-air">
        <span className="offer-avatar" aria-hidden="true">
          {offer.airline}
        </span>
        <div>
          <div className="offer-airname">{offer.airlineName}</div>
          <div className="offer-sub">{stopsLabel(offer.transfers)}</div>
        </div>
      </div>

      <div className="offer-mid">
        <div className="offer-time">
          <b>{hhmm(offer.departAt)}</b>
          <span>{offer.origin}</span>
        </div>
        <div className="offer-path">
          <span className="offer-dur">{formatDuration(offer.durationMin)}</span>
          <span className="offer-line" />
          <span className="offer-stop">{stopsLabel(offer.transfers)}</span>
        </div>
        <div className="offer-time">
          <b>{hhmm(offer.arriveAt)}</b>
          <span>{offer.destination}</span>
        </div>
      </div>

      <div className="offer-buy">
        <div className="offer-price">
          {offer.price}
          {offer.currency === "EUR" ? "€" : ` ${offer.currency}`}
        </div>
        <a
          className="offer-cta"
          href={offer.bookingUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
        >
          Voir l&apos;offre
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 17 17 7M8 7h9v9" />
          </svg>
        </a>
      </div>
    </article>
  );
}
