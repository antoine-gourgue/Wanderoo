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
        images: [1, 2, 3, 4, 5].map((n) => hotellookPhoto(id, n)),
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
      images: [0, 1, 2, 3, 4].map((k) => `/hotels/h${((i * 3 + k) % 12) + 1}.jpg`),
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

/** Retrouve un hôtel d'une recherche par son id (la liste simulée est déterministe). */
export async function findHotel(p: HotelSearchParams, id: string): Promise<{ hotel: HotelOffer; source: "live" | "mock" } | null> {
  const { hotels, source } = await searchHotels(p);
  const hotel = hotels.find((h) => h.id === id);
  return hotel ? { hotel, source } : null;
}

/* -------------------- Contenu de la fiche (dérivé, déterministe) -------------------- */

export type HotelDetails = {
  description: string;
  highlights: { title: string; sub: string }[];
  categories: { label: string; score: number }[];
  reviews: { name: string; date: string; text: string; score: number }[];
};

const FIRST_NAMES = ["Camille", "Julien", "Sofia", "Marc", "Lena", "Hugo", "Inès", "Thomas", "Chloé", "Nils", "Amira", "Paul"];
const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const REVIEW_TEXTS = [
  "Très bel hôtel, chambre calme et propre. Le personnel est aux petits soins et le petit-déjeuner copieux.",
  "Emplacement parfait pour visiter à pied. Literie confortable, salle de bain moderne. Nous reviendrons.",
  "Accueil chaleureux et check-in rapide. La chambre donnait sur une cour, aucun bruit la nuit.",
  "Bon rapport qualité-prix. Quelques finitions un peu datées mais tout était impeccable.",
  "Le rooftop et le bar valent le détour. Chambre spacieuse, wifi rapide, idéal pour un week-end.",
  "Séjour agréable : hôtel bien situé, équipe souriante, petits détails soignés. Je recommande.",
];

export function hotelDetails(h: HotelOffer): HotelDetails {
  const rnd = mulberry32(hashString(h.id));
  const cat = () => Math.round(Math.min(5, Math.max(3.8, h.rating + (rnd() - 0.5) * 0.4)) * 10) / 10;
  const categories = ["Propreté", "Exactitude", "Arrivée", "Communication", "Emplacement", "Qualité-prix"].map((label) => ({ label, score: cat() }));
  const reviews = Array.from({ length: 6 }, (_, k) => ({
    name: FIRST_NAMES[(k + Math.floor(rnd() * FIRST_NAMES.length)) % FIRST_NAMES.length],
    date: `${MONTHS[Math.floor(rnd() * 12)]} 2026`,
    text: REVIEW_TEXTS[(k + Math.floor(rnd() * REVIEW_TEXTS.length)) % REVIEW_TEXTS.length],
    score: rnd() < 0.8 ? 5 : 4,
  }));
  const highlights = [
    h.distanceKm < 2
      ? { title: "Emplacement idéal", sub: `À ${h.distanceKm} km du centre de ${h.city}, dans le quartier ${h.area}.` }
      : { title: "Au calme", sub: `À ${h.distanceKm} km du centre, dans le quartier ${h.area}.` },
    h.freeCancel
      ? { title: "Annulation gratuite", sub: "Annulez sans frais jusqu'à 24 h avant l'arrivée." }
      : { title: "Tarif tout compris", sub: "Taxes et frais inclus dans le prix affiché." },
    h.breakfast
      ? { title: "Petit-déjeuner inclus", sub: "Servi chaque matin au restaurant de l'hôtel." }
      : { title: "Réception 24 h/24", sub: "Arrivée possible à toute heure, bagagerie disponible." },
  ];
  const amen = h.amenities.slice(0, 3).map((a) => a.toLowerCase()).join(", ");
  const description = `${h.name} est un hôtel ${h.stars} étoiles situé dans le quartier ${h.area}, à ${h.distanceKm} km du centre de ${h.city}. ${
    amen ? `Vous y trouverez ${amen}. ` : ""
  }Les chambres, climatisées et calmes, sont pensées pour les courts séjours comme pour les longs ; l'équipe de réception vous accueille avec ses conseils sur le quartier.`;
  return { description, highlights, categories, reviews };
}
