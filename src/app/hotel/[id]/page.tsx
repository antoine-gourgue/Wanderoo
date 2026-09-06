import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Header, { type CompactSearch } from "@/components/Header";
import HotelGallery from "@/components/HotelGallery";
import HotelMapSingle from "@/components/HotelMapSingle";
import SaveButton from "@/components/SaveButton";
import StayCalendar from "@/components/StayCalendar";
import { getFavoriteSlugs } from "@/lib/favorites";
import { cityName } from "@/lib/format";
import { findHotel, hotelDetails, nightsBetween } from "@/lib/hotels";

type SP = Record<string, string | string[] | undefined>;

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function frDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return Number.isNaN(d.getTime()) ? iso : new Intl.DateTimeFormat("fr-FR", { ...opts, timeZone: "UTC" }).format(d);
}

const AMENITY_ICON: Record<string, React.ReactNode> = {
  Wifi: <path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M2 9a14 14 0 0 1 20 0M12 20h.01" />,
  "Petit-déjeuner": <path d="M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Zm12 2h2a2 2 0 0 1 0 4h-2M3 21h14" />,
  Piscine: <path d="M2 18c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M2 13c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M7 12V5a2 2 0 0 1 4 0M13 12V5a2 2 0 0 1 4 0" />,
  Parking: <path d="M6 20V4h6a4 4 0 0 1 0 8H6" />,
  Climatisation: <path d="M12 2v20M2 12h20M5 5l14 14M19 5 5 19" />,
  "Salle de sport": <path d="M4 10v4M20 10v4M7 8v8M17 8v8M7 12h10" />,
  Spa: <path d="M12 21c-5 0-8-4-8-8 3 0 5 1 8 4 3-3 5-4 8-4 0 4-3 8-8 8ZM12 17V3" />,
  Bar: <path d="M6 3h12l-6 8-6-8ZM12 11v9M8 20h8" />,
  Terrasse: <path d="M3 20h18M4 20V9l8-5 8 5v11M9 20v-6h6v6" />,
  "Animaux acceptés": <path d="M8 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM4 11a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm16 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8 2c-3 0-5 3-5 5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2c0-2-2-5-5-5Z" />,
};

export default async function HotelPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<SP> }) {
  const [{ id: rawId }, sp] = await Promise.all([params, searchParams]);
  const id = decodeURIComponent(rawId);
  const cityFromId = id.match(/^mock-([A-Z]{3})-/)?.[1];
  const to = (one(sp.to) ?? cityFromId ?? "PAR").toUpperCase();
  const toName = one(sp.toName) ?? cityName(to);
  const depart = one(sp.depart) ?? "2026-10-09";
  const ret = one(sp.return) ?? "2026-10-13";
  const pax = Number(one(sp.pax) ?? "2") || 2;
  const children = Number(one(sp.children) ?? "0") || 0;
  const rooms = Number(one(sp.rooms) ?? "1") || 1;

  const [found, favs] = await Promise.all([
    findHotel({ city: to, cityName: toName, checkIn: depart, checkOut: ret, adults: pax, children, rooms }, id),
    getFavoriteSlugs(),
  ]);
  if (!found) notFound();
  const { hotel, source } = found;
  const d = hotelDetails(hotel);
  const nights = nightsBetween(depart, ret);
  const travellers = pax + children;
  const dateLabel = `${frDate(depart)} – ${frDate(ret)}`;
  const avgTotal = hotel.total; // pas de moyenne ici : l'encart compare au prix moyen de la ville si disponible
  const stars = "★".repeat(hotel.stars);

  const compact: CompactSearch = {
    label: `${toName} · Hôtels`,
    dates: dateLabel,
    pax: `${travellers} voyageur${travellers > 1 ? "s" : ""}`,
    tab: "hotel",
    initial: {
      destination: { code: to, name: toName, country: "", type: "city" },
      depart,
      ret,
      pax,
      children,
      rooms,
    },
  };

  return (
    <>
      <Header compact={compact} />
      <main className="lst">
        <div className="lst-title">
          <h1>{hotel.name}</h1>
          <div className="lst-actions">
            <a className="lst-action" href="#partager">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3v12M8 7l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
              </svg>
              Partager
            </a>
            <SaveButton slug={`hotel-${hotel.id}`} label={hotel.name} imageUrl={hotel.images[0]} saved={favs.has(`hotel-${hotel.id}`)} />
          </div>
        </div>

        <HotelGallery images={hotel.images} name={hotel.name} />

        <div className="lst-cols">
          <section className="lst-left">
            <div className="lst-sec lst-sec-first">
              <h2 className="lst-h2">
                Hôtel {hotel.stars} étoiles · {hotel.area}, {hotel.city}
              </h2>
              <p className="lst-sub">
                {travellers} voyageur{travellers > 1 ? "s" : ""} · {rooms} chambre{rooms > 1 ? "s" : ""} · {nights} nuit{nights > 1 ? "s" : ""} ·{" "}
                {hotel.breakfast ? "petit-déjeuner inclus" : "petit-déjeuner en option"}
              </p>
              {hotel.badge ? (
                <div className="lst-fav">
                  <span className="lst-fav-l">{hotel.badge}</span>
                  <span className="lst-fav-m">Un des hôtels préférés des voyageurs sur Wanderoo</span>
                  <span className="lst-fav-r">
                    <b>{hotel.rating.toFixed(1).replace(".", ",")}</b>
                    <i aria-hidden="true">{stars}</i>
                  </span>
                  <span className="lst-fav-r">
                    <b>{hotel.reviews}</b>
                    <small>Commentaires</small>
                  </span>
                </div>
              ) : null}
            </div>

            <div className="lst-host">
              <span className="lst-ava" aria-hidden="true">
                {hotel.name.replace(/^(Hôtel|Le|La|Maison|Villa|Grand)\s+/i, "").charAt(0).toUpperCase()}
              </span>
              <div>
                <b>Établissement géré par {hotel.name}</b>
                <small>Hôtel {hotel.stars} étoiles · Réception 24 h/24</small>
              </div>
            </div>

            <ul className="lst-hl">
              {d.highlights.map((h) => (
                <li key={h.title}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="m8 12 3 3 5-6" />
                  </svg>
                  <div>
                    <b>{h.title}</b>
                    <small>{h.sub}</small>
                  </div>
                </li>
              ))}
            </ul>

            <p className="lst-desc">{d.description}</p>

            <div className="lst-sec">
              <h2 className="lst-h2">Ce que propose cet hôtel</h2>
              <ul className="lst-amen">
                {(hotel.amenities.length ? hotel.amenities : ["Wifi", "Climatisation"]).map((a) => (
                  <li key={a}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {AMENITY_ICON[a] ?? <circle cx="12" cy="12" r="8" />}
                    </svg>
                    {a}
                  </li>
                ))}
              </ul>
              <span className="lst-btn">Afficher les {Math.max(hotel.amenities.length, 2) + 8} équipements</span>
            </div>

            <div className="lst-sec lst-sec-last">
              <h2 className="lst-h2">
                {nights} nuit{nights > 1 ? "s" : ""} à {hotel.city}
              </h2>
              <p className="lst-sub">
                {frDate(depart, { day: "numeric", month: "short", year: "numeric" })} – {frDate(ret, { day: "numeric", month: "short", year: "numeric" })}
              </p>
              <StayCalendar start={depart} end={ret} />
            </div>
          </section>

          <aside className="lst-right">
            <div className="lst-sticky">
              {hotel.badge ? (
                <div className="lst-notice">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 3l2.2 5 5.3.5-4 3.6 1.2 5.3L12 14.7l-4.7 2.7 1.2-5.3-4-3.6 5.3-.5Z" />
                  </svg>
                  <span>
                    <b>Perle rare !</b> Les réservations pour cet hôtel sont fréquentes.
                  </span>
                </div>
              ) : null}
              <div className="pbox">
                <div className="pbox-price">{hotel.total} € au total</div>
                <div className="pbox-sub">
                  pour {nights} nuit{nights > 1 ? "s" : ""} · {hotel.pricePerNight} € / nuit
                </div>
                <div className="pbox-grid">
                  <div className="pbox-cell">
                    <small>Arrivée</small>
                    <span>{frDate(depart, { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
                  </div>
                  <div className="pbox-cell">
                    <small>Départ</small>
                    <span>{frDate(ret, { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
                  </div>
                  <div className="pbox-cell full">
                    <small>Voyageurs</small>
                    <span>
                      {travellers} voyageur{travellers > 1 ? "s" : ""} · {rooms} chambre{rooms > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <a className="pbox-btn" href={hotel.bookingUrl} target="_blank" rel="noopener noreferrer sponsored">
                  Réserver
                </a>
                <p className="pbox-note">Vous ne serez pas débité pour le moment</p>
                <div className="pbox-lines">
                  <div className="pbox-line">
                    <span>
                      {hotel.pricePerNight} € × {nights} nuit{nights > 1 ? "s" : ""}
                    </span>
                    <span>{avgTotal} €</span>
                  </div>
                  <div className="pbox-line">
                    <span>Frais de service Wanderoo</span>
                    <span>0 €</span>
                  </div>
                  <div className="pbox-line total">
                    <span>Total</span>
                    <span>{hotel.total} €</span>
                  </div>
                </div>
              </div>
              {source === "mock" ? <p className="lst-demo">Données de démonstration — ajoutez un token Travelpayouts pour les vrais prix.</p> : null}
            </div>
          </aside>
        </div>

        <section className="lst-sec lst-wide">
          <div className="lst-rating">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2l2.9 6.3 6.8.6-5.1 4.5 1.5 6.7L12 17.8 5.9 20.6l1.5-6.7L2.3 8.9l6.8-.6z" />
            </svg>
            {hotel.rating.toFixed(2).replace(".", ",")} · {hotel.reviews} commentaires
          </div>
          <div className="lst-cats">
            {d.categories.map((c) => (
              <div className="lst-cat" key={c.label}>
                <small>{c.label}</small>
                <b>{c.score.toFixed(1).replace(".", ",")}</b>
                <span className="lst-bar">
                  <i style={{ width: `${(c.score / 5) * 100}%` }} />
                </span>
              </div>
            ))}
          </div>
          <div className="lst-revs">
            {d.reviews.map((r, i) => (
              <article className="lst-rev" key={`${r.name}-${i}`}>
                <div className="who">
                  <span className="lst-ava">{r.name.charAt(0)}</span>
                  <div>
                    <b>{r.name}</b>
                    <small>
                      {"★".repeat(r.score)} · {r.date}
                    </small>
                  </div>
                </div>
                <p>{r.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="lst-sec lst-wide">
          <h2 className="lst-h2">Où se situe l&apos;hôtel</h2>
          <p className="lst-sub">
            {hotel.area}, {hotel.city} · à {hotel.distanceKm} km du centre
          </p>
          <div className="lst-map">
            <HotelMapSingle hotel={hotel} />
          </div>
        </section>

        <section className="lst-sec lst-wide lst-sec-last">
          <h2 className="lst-h2">À savoir</h2>
          <div className="lst-know">
            <div>
              <h3>Règlement intérieur</h3>
              <ul>
                <li>Arrivée à partir de 15:00</li>
                <li>Départ avant 11:00</li>
                <li>{hotel.amenities.includes("Animaux acceptés") ? "Animaux acceptés" : "Animaux non admis"}</li>
              </ul>
            </div>
            <div>
              <h3>Sécurité</h3>
              <ul>
                <li>Détecteur de fumée</li>
                <li>Réception 24 h/24</li>
                <li>Coffre-fort en chambre</li>
              </ul>
            </div>
            <div>
              <h3>Conditions d&apos;annulation</h3>
              <ul>
                <li>{hotel.freeCancel ? "Annulation gratuite jusqu'à 24 h avant l'arrivée" : "Tarif non remboursable"}</li>
                <li>Modification des dates selon disponibilité</li>
                <li>Le prix affiché inclut taxes et frais</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
