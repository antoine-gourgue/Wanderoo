// Hôtels : API Hotellook (Travelpayouts) avec repli sur données simulées.
// Doc : https://support.travelpayouts.com/hc/en-us/articles/203956163 (cache.json)
// Sans TRAVELPAYOUTS_TOKEN (ou en cas d'erreur), on renvoie des hôtels simulés.

import { hashString, mulberry32 } from "@/lib/random";

export type HotelOffer = {
  id: string;
  name: string;
  stars: number;
  rating: number; // sur 5, une décimale
  reviews: number;
  area: string;
  city: string;
  lat: number;
  lng: number;
  distanceKm: number;
  pricePerNight: number;
  nights: number;
  total: number;
  currency: "EUR";
  images: string[];
  badge?: "Coup de cœur voyageurs" | "Superhôte";
  amenities: string[];
  freeCancel: boolean;
  breakfast: boolean;
  bookingUrl: string;
};

export type HotelSearchParams = {
  city: string; // code (PAR, LIS…) ou nom
  cityName: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string;
  adults: number;
  children?: number;
  rooms?: number;
};

export type HotelSearchResult = {
  hotels: HotelOffer[];
  source: "live" | "mock";
  center: { lat: number; lng: number };
};

const CENTERS: Record<string, { lat: number; lng: number }> = {
  PAR: { lat: 48.8566, lng: 2.3522 },
  LIS: { lat: 38.7223, lng: -9.1393 },
  BCN: { lat: 41.3874, lng: 2.1686 },
  FCO: { lat: 41.9028, lng: 12.4964 },
  ROM: { lat: 41.9028, lng: 12.4964 },
  NYC: { lat: 40.7128, lng: -74.006 },
  LON: { lat: 51.5072, lng: -0.1276 },
  AMS: { lat: 52.3676, lng: 4.9041 },
  MAD: { lat: 40.4168, lng: -3.7038 },
  BER: { lat: 52.52, lng: 13.405 },
  ATH: { lat: 37.9838, lng: 23.7275 },
};

const AREAS: Record<string, string[]> = {
  PAR: ["Le Marais", "Saint-Germain-des-Prés", "Montmartre", "Opéra", "Bastille", "Quartier latin", "Champs-Élysées", "Canal Saint-Martin", "Pigalle", "Batignolles", "Louvre", "Belleville"],
  LIS: ["Alfama", "Baixa", "Chiado", "Bairro Alto", "Belém", "Príncipe Real", "Graça", "Cais do Sodré"],
  BCN: ["Eixample", "Barri Gòtic", "El Born", "Gràcia", "Barceloneta", "Poblenou", "Sant Antoni", "Raval"],
};
const GENERIC_AREAS = ["Centre historique", "Vieille ville", "Quartier des arts", "Bord de mer", "Quartier de la gare", "Cœur de ville", "Quartier des musées", "Colline"];

const NAMES = [
  "Hôtel Le Marais", "Maison Albar", "Hôtel des Grands Boulevards", "Le Pigalle", "Hôtel Monte Cristo", "Villa Madame",
  "Hôtel Fabric", "Le Roch Hotel & Spa", "Hôtel Providence", "Hôtel Bachaumont", "Le Narcisse Blanc", "Hôtel Henriette",
  "Hôtel Bienvenue", "Grand Hôtel Saint-Michel", "Hôtel Pilgrim", "Le Ballu",
];
const AMENITIES = ["Wifi", "Petit-déjeuner", "Piscine", "Parking", "Climatisation", "Salle de sport", "Spa", "Bar", "Terrasse", "Animaux acceptés"];

export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(`${checkIn}T12:00:00Z`).getTime();
  const b = new Date(`${checkOut}T12:00:00Z`).getTime();
  const n = Math.round((b - a) / 86400000);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function centerFor(city: string): { lat: number; lng: number } {
  return CENTERS[city.toUpperCase()] ?? CENTERS.PAR;
}

function hotellookPhoto(hotelId: number, n: number): string {
  return `https://photo.hotellook.com/image_v2/limit/h${hotelId}_${n}/800/600.auto`;
}

/* -------------------- API réelle (cache Hotellook) -------------------- */

type CacheItem = {
  hotelId?: number;
  hotelName?: string;
  stars?: number;
  priceFrom?: number;
  priceAvg?: number;
  location?: { name?: string; country?: string; geo?: { lat?: number; lon?: number } };
};

async function fetchLive(p: HotelSearchParams, token: string): Promise<HotelOffer[]> {
  const url = new URL("https://engine.hotellook.com/api/v2/cache.json");
  url.searchParams.set("location", p.cityName);
  url.searchParams.set("checkIn", p.checkIn);
  url.searchParams.set("checkOut", p.checkOut);
  url.searchParams.set("adults", String(p.adults));
  url.searchParams.set("currency", "eur");
  url.searchParams.set("limit", "24");
  url.searchParams.set("token", token);
  const res = await fetch(url, { next: { revalidate: 900 } });
  if (!res.ok) throw new Error(`Hotellook HTTP ${res.status}`);
  const json = (await res.json()) as CacheItem[];
  if (!Array.isArray(json)) throw new Error("Réponse Hotellook inattendue");

  const nights = nightsBetween(p.checkIn, p.checkOut);
  const center = centerFor(p.city);
  const marker = process.env.TRAVELPAYOUTS_MARKER;
  return json
    .filter((h) => h.hotelId && h.hotelName)
    .map((h, i): HotelOffer => {
      const id = h.hotelId as number;
      const lat = h.location?.geo?.lat ?? center.lat;
      const lng = h.location?.geo?.lon ?? center.lng;
      const perNight = Math.round(h.priceFrom ?? h.priceAvg ?? 0);
      const rnd = mulberry32(id);
      return {
        id: String(id),
        name: h.hotelName as string,
        stars: h.stars ?? 3,
        rating: Math.round((3.8 + rnd() * 1.1) * 10) / 10,
        reviews: 50 + Math.floor(rnd() * 1500),
        area: h.location?.name ?? p.cityName,
        city: p.cityName,
        lat,
        lng,
        distanceKm: Math.round(distanceKm(center, { lat, lng }) * 10) / 10,
        pricePerNight: perNight,
        nights,
        total: perNight * nights,
        currency: "EUR",
        images: [1, 2, 3].map((n) => hotellookPhoto(id, n)),
        badge: i % 4 === 0 ? "Coup de cœur voyageurs" : undefined,
        amenities: AMENITIES.filter(() => rnd() < 0.45),
        freeCancel: rnd() < 0.6,
        breakfast: rnd() < 0.4,
        bookingUrl: `https://search.hotellook.com/?hotelId=${id}&checkIn=${p.checkIn}&checkOut=${p.checkOut}&adults=${p.adults}${marker ? `&marker=${marker}` : ""}`,
      };
    });
}

/* -------------------- Données simulées -------------------- */

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function mockHotels(p: HotelSearchParams): HotelOffer[] {
  const center = centerFor(p.city);
  const nights = nightsBetween(p.checkIn, p.checkOut);
  const areas = AREAS[p.city.toUpperCase()] ?? GENERIC_AREAS;
  const rnd = mulberry32(hashString(`${p.city}${p.checkIn}${p.checkOut}`));
  const hotels: HotelOffer[] = [];
  for (let i = 0; i < 12; i++) {
    const stars = 3 + (rnd() < 0.55 ? 1 : 0) + (rnd() < 0.2 ? 1 : 0);
    const perNight = Math.round((55 + stars * 28 + rnd() * 90) * (p.rooms ?? 1));
    const lat = center.lat + (rnd() - 0.5) * 0.06;
    const lng = center.lng + (rnd() - 0.5) * 0.09;
    const badgeRoll = rnd();
    hotels.push({
      id: `mock-${p.city}-${i}`,
      name: NAMES[i % NAMES.length],
      stars,
      rating: Math.round((3.9 + rnd() * 1.0) * 10) / 10,
      reviews: 40 + Math.floor(rnd() * 1800),
      area: areas[i % areas.length],
      city: p.cityName,
      lat,
      lng,
      distanceKm: Math.round(distanceKm(center, { lat, lng }) * 10) / 10,
      pricePerNight: perNight,
      nights,
      total: perNight * nights,
      currency: "EUR",
      images: [0, 1, 2].map((k) => `/hotels/h${((i * 3 + k) % 12) + 1}.jpg`),
      badge: badgeRoll < 0.3 ? "Coup de cœur voyageurs" : badgeRoll < 0.42 ? "Superhôte" : undefined,
      amenities: AMENITIES.filter(() => rnd() < 0.45),
      freeCancel: rnd() < 0.6,
      breakfast: rnd() < 0.4,
      bookingUrl: `https://search.hotellook.com/?destination=${encodeURIComponent(p.cityName)}&checkIn=${p.checkIn}&checkOut=${p.checkOut}&adults=${p.adults}`,
    });
  }
  return hotels;
}

/* -------------------- Point d'entrée -------------------- */

export async function searchHotels(p: HotelSearchParams): Promise<HotelSearchResult> {
  const center = centerFor(p.city);
  const token = process.env.TRAVELPAYOUTS_TOKEN;
  if (token) {
    try {
      const hotels = await fetchLive(p, token);
      if (hotels.length > 0) {
        hotels.sort((a, b) => a.total - b.total);
        return { hotels, source: "live", center };
      }
    } catch (err) {
      console.warn("[hotellook] repli sur données simulées :", err);
    }
  }
  const hotels = mockHotels(p).sort((a, b) => a.total - b.total);
  return { hotels, source: "mock", center };
}
