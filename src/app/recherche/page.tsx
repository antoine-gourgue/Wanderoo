import CarResults from "@/components/CarResults";
import Header, { type CompactSearch } from "@/components/Header";
import HotelResults from "@/components/HotelResults";
import OffersList from "@/components/OffersList";
import RouteSidePanel from "@/components/RouteSidePanel";
import { searchCars } from "@/lib/cars";
import { getFavoriteSlugs } from "@/lib/favorites";
import { cityName } from "@/lib/format";
import { searchHotels } from "@/lib/hotels";
import { searchFlights } from "@/lib/travelpayouts";

type SP = Record<string, string | string[] | undefined>;

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function frDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" }).format(d);
}

export default async function RecherchePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const rawType = one(sp.type);
  const tab = rawType === "hotel" || rawType === "car" ? rawType : "vol";
  const from = (one(sp.from) ?? "PAR").toUpperCase();
  const to = (one(sp.to) ?? "LIS").toUpperCase();
  const depart = one(sp.depart) ?? "2026-03-12";
  const ret = one(sp.return);
  const pax = Number(one(sp.pax) ?? "1") || 1;
  const children = Number(one(sp.children) ?? "0") || 0;
  const rooms = Number(one(sp.rooms) ?? "1") || 1;
  const fromName = one(sp.fromName) ?? cityName(from);
  const toName = one(sp.toName) ?? cityName(to);

  const dateLabel = [frDate(depart), frDate(ret)].filter(Boolean).join(" – ");
  const travellers = pax + children;
  const paxLabel = `${travellers} voyageur${travellers > 1 ? "s" : ""}`;

  const compact: CompactSearch = {
    label: tab === "vol" ? `${fromName} → ${toName}` : `${toName} · ${tab === "hotel" ? "Hôtels" : "Voiture"}`,
    dates: dateLabel || "Dates",
    pax: paxLabel,
    tab,
    initial: {
      origin: { code: from, name: fromName, country: "", type: "city" },
      destination: { code: to, name: toName, country: "", type: "city" },
      depart,
      ret: ret ?? "",
      pax,
      children,
      rooms,
    },
  };

  if (tab === "car") {
    const [{ cars, source }, favs] = await Promise.all([
      searchCars({ pickup: from, pickupName: fromName, dropoffName: toName, from: depart, to: ret ?? depart, drivers: pax }),
      getFavoriteSlugs(),
    ]);
    return (
      <>
        <Header compact={{ ...compact, label: `${fromName} · Voiture`, pax: `${pax} conducteur${pax > 1 ? "s" : ""}` }} />
        <CarResults cars={cars} cityName={fromName} dateLabel={dateLabel} demo={source === "mock"} savedSlugs={[...favs]} />
      </>
    );
  }

  if (tab === "hotel") {
    const [{ hotels, source, center }, favs] = await Promise.all([
      searchHotels({ city: to, cityName: toName, checkIn: depart, checkOut: ret ?? depart, adults: pax, children, rooms }),
      getFavoriteSlugs(),
    ]);
    return (
      <>
        <Header compact={compact} />
        <HotelResults hotels={hotels} center={center} title={toName} demo={source === "mock"} savedSlugs={[...favs]} />
      </>
    );
  }

  const { offers, source } = await searchFlights({ from, to, depart, return: ret, passengers: pax });
  const best = offers[0]?.price ?? 0;
  const avg = offers.length ? Math.round(offers.reduce((s, o) => s + o.price, 0) / offers.length) : 0;

  return (
    <>
      <Header compact={compact} />
      <OffersList
        offers={offers}
        title={`${fromName} → ${toName}`}
        demo={source === "mock"}
        side={
          <RouteSidePanel
            from={from}
            to={to}
            fromName={fromName}
            toName={toName}
            dateLabel={dateLabel}
            paxLabel={paxLabel}
            best={best}
            avg={avg}
            count={offers.length}
            live={source === "live"}
          />
        }
      />
    </>
  );
}
