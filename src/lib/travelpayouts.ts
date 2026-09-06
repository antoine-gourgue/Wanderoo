// Client Travelpayouts (données de vols) avec repli sur données simulées.
// Doc API : https://support.travelpayouts.com/hc/en-us (Flight data API v3)
// Tant que TRAVELPAYOUTS_TOKEN n'est pas défini (ou si l'appel échoue),
// on renvoie des offres simulées pour que l'UI fonctionne de bout en bout.

export type FlightOffer = {
  id: string;
  airline: string; // code IATA, ex. "TP"
  airlineName: string;
  origin: string; // ex. "PAR"
  destination: string; // ex. "LIS"
  departAt: string; // ISO
  arriveAt: string; // ISO
  durationMin: number;
  transfers: number; // 0 = direct
  price: number; // dans la devise ci-dessous
  currency: string;
  bookingUrl: string;
};

export type FlightSearchParams = {
  from: string;
  to: string;
  depart: string; // YYYY-MM-DD
  return?: string; // YYYY-MM-DD
  passengers?: number;
};

export type FlightSearchResult = {
  offers: FlightOffer[];
  source: "live" | "mock";
  currency: string;
};

const AIRLINES: Record<string, string> = {
  TP: "TAP Air Portugal",
  AF: "Air France",
  U2: "easyJet",
  FR: "Ryanair",
  IB: "Iberia",
  LH: "Lufthansa",
  VY: "Vueling",
  BA: "British Airways",
  KL: "KLM",
  SN: "Brussels Airlines",
};

export function airlineName(code: string): string {
  return AIRLINES[code] ?? code;
}

const AVIASALES = "https://www.aviasales.com";

function aviasalesSearchUrl(p: FlightSearchParams): string {
  const marker = process.env.TRAVELPAYOUTS_MARKER;
  const url = `${AVIASALES}/search/${p.from}${fmtDayMonth(p.depart)}${p.to}${
    p.return ? fmtDayMonth(p.return) : ""
  }${p.passengers ?? 1}`;
  return marker ? `${url}?marker=${marker}` : url;
}

function fmtDayMonth(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}${mm}`;
}

/* -------------------- API réelle -------------------- */

type ApiItem = {
  origin?: string;
  destination?: string;
  price?: number;
  airline?: string;
  flight_number?: number;
  departure_at?: string;
  return_at?: string;
  transfers?: number;
  duration?: number;
  duration_to?: number;
  link?: string;
};

async function fetchLive(
  params: FlightSearchParams,
  token: string,
): Promise<FlightOffer[]> {
  const url = new URL(
    "https://api.travelpayouts.com/aviasales/v3/prices_for_dates",
  );
  url.searchParams.set("origin", params.from);
  url.searchParams.set("destination", params.to);
  url.searchParams.set("departure_at", params.depart);
  if (params.return) url.searchParams.set("return_at", params.return);
  url.searchParams.set("currency", "eur");
  url.searchParams.set("sorting", "price");
  url.searchParams.set("unique", "false");
  url.searchParams.set("limit", "30");
  url.searchParams.set("token", token);

  const res = await fetch(url, { next: { revalidate: 900 } });
  if (!res.ok) throw new Error(`Travelpayouts HTTP ${res.status}`);
  const json = (await res.json()) as { success?: boolean; data?: ApiItem[] };
  if (!json.success || !Array.isArray(json.data)) {
    throw new Error("Réponse Travelpayouts inattendue");
  }

  const marker = process.env.TRAVELPAYOUTS_MARKER;
  return json.data.map((it, i): FlightOffer => {
    const departAt = it.departure_at ?? `${params.depart}T08:00:00`;
    const durationMin = it.duration ?? it.duration_to ?? 150;
    return {
      id: `${it.airline ?? "XX"}-${it.flight_number ?? i}`,
      airline: it.airline ?? "XX",
      airlineName: airlineName(it.airline ?? "XX"),
      origin: it.origin ?? params.from,
      destination: it.destination ?? params.to,
      departAt,
      arriveAt: addMinutes(departAt, durationMin),
      durationMin,
      transfers: it.transfers ?? 0,
      price: Math.round(it.price ?? 0),
      currency: "EUR",
      bookingUrl: it.link
        ? `${AVIASALES}${it.link}${it.link.includes("?") ? "&" : "?"}${
            marker ? `marker=${marker}` : ""
          }`
        : aviasalesSearchUrl(params),
    };
  });
}

/* -------------------- Données simulées -------------------- */

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function addMinutes(iso: string, min: number): string {
  return new Date(new Date(iso).getTime() + min * 60000).toISOString();
}

function mockFlights(params: FlightSearchParams): FlightOffer[] {
  const codes = Object.keys(AIRLINES);
  const rnd = mulberry32(hashString(`${params.from}${params.to}${params.depart}`));
  const offers: FlightOffer[] = [];
  for (let i = 0; i < 6; i++) {
    const airline = codes[Math.floor(rnd() * codes.length)];
    const transfers = rnd() < 0.55 ? 0 : 1;
    const durationMin = transfers === 0
      ? 95 + Math.floor(rnd() * 85)
      : 240 + Math.floor(rnd() * 200);
    const price = 39 + Math.floor(rnd() * 190) + transfers * 15;
    const departHour = 6 + Math.floor(rnd() * 14);
    const departMin = rnd() < 0.5 ? 0 : 30;
    const departAt = `${params.depart}T${String(departHour).padStart(2, "0")}:${String(departMin).padStart(2, "0")}:00.000Z`;
    offers.push({
      id: `mock-${i}`,
      airline,
      airlineName: airlineName(airline),
      origin: params.from,
      destination: params.to,
      departAt,
      arriveAt: addMinutes(departAt, durationMin),
      durationMin,
      transfers,
      price,
      currency: "EUR",
      bookingUrl: aviasalesSearchUrl(params),
    });
  }
  return offers;
}

/* -------------------- Point d'entrée -------------------- */

export async function searchFlights(
  params: FlightSearchParams,
): Promise<FlightSearchResult> {
  const token = process.env.TRAVELPAYOUTS_TOKEN;
  if (token) {
    try {
      const offers = await fetchLive(params, token);
      if (offers.length > 0) {
        offers.sort((a, b) => a.price - b.price);
        return { offers, source: "live", currency: "EUR" };
      }
    } catch (err) {
      console.warn("[travelpayouts] repli sur données simulées :", err);
    }
  }
  const offers = mockFlights(params).sort((a, b) => a.price - b.price);
  return { offers, source: "mock", currency: "EUR" };
}
