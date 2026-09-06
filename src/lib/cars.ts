// Location de voitures : données simulées (pas d'API gratuite de location).
// Le jour où un partenaire (Travelpayouts Cars, Rentalcars…) est branché, on garde
// le même modèle et on remplace `mockCars` par un appel réel.

import { hashString, mulberry32 } from "@/lib/random";
import { nightsBetween } from "@/lib/hotels";

export type CarCategory = "Citadine" | "Compacte" | "Berline" | "SUV" | "Monospace" | "Utilitaire" | "Électrique" | "Cabriolet";
export type Transmission = "Manuelle" | "Automatique";

export type CarOffer = {
  id: string;
  model: string; // "Renault Clio ou similaire"
  category: CarCategory;
  transmission: Transmission;
  seats: number;
  bags: number;
  electric: boolean;
  supplier: string;
  rating: number;
  reviews: number;
  pricePerDay: number;
  days: number;
  total: number;
  currency: "EUR";
  freeCancel: boolean;
  unlimitedKm: boolean;
  pickup: string; // "Paris — Gare de Lyon"
  bookingUrl: string;
};

export type CarSearchParams = {
  pickup: string; // code ou nom
  pickupName: string;
  dropoffName?: string;
  from: string; // YYYY-MM-DD
  to: string;
  drivers: number;
};

export type CarSearchResult = { cars: CarOffer[]; source: "live" | "mock" };

export const CAR_CATEGORIES: CarCategory[] = ["Citadine", "Compacte", "Berline", "SUV", "Monospace", "Utilitaire", "Électrique", "Cabriolet"];

const MODELS: Record<CarCategory, string[]> = {
  Citadine: ["Renault Clio", "Peugeot 208", "Toyota Yaris", "Fiat 500", "Volkswagen Polo"],
  Compacte: ["Peugeot 308", "Volkswagen Golf", "Renault Mégane", "Seat Leon"],
  Berline: ["Peugeot 508", "BMW Série 3", "Mercedes Classe C", "Audi A4"],
  SUV: ["Peugeot 3008", "Volkswagen Tiguan", "Toyota RAV4", "Dacia Duster", "Nissan Qashqai"],
  Monospace: ["Renault Espace", "Citroën Grand C4", "Volkswagen Touran"],
  Utilitaire: ["Renault Trafic", "Fiat Ducato", "Peugeot Expert"],
  Électrique: ["Tesla Model 3", "Renault Zoé", "Peugeot e-208", "MG4", "Tesla Model Y"],
  Cabriolet: ["Mini Cabrio", "Fiat 500C", "BMW Série 4 Cabriolet"],
};
const BASE_PRICE: Record<CarCategory, number> = {
  Citadine: 26, Compacte: 34, Berline: 58, SUV: 52, Monospace: 64, Utilitaire: 49, Électrique: 55, Cabriolet: 79,
};
const SEATS: Record<CarCategory, [number, number]> = {
  Citadine: [4, 1], Compacte: [5, 2], Berline: [5, 3], SUV: [5, 3], Monospace: [7, 4], Utilitaire: [3, 6], Électrique: [5, 2], Cabriolet: [4, 1],
};
const SUPPLIERS = ["Europcar", "Hertz", "Avis", "Sixt", "Getaround", "Enterprise", "Budget", "Ada"];
const STATIONS: Record<string, string[]> = {
  PAR: ["Gare de Lyon", "Gare du Nord", "Montparnasse", "Aéroport CDG", "Aéroport Orly", "Porte Maillot", "Bastille"],
  LIS: ["Aéroport", "Gare d'Oriente", "Centre-ville", "Cais do Sodré"],
  BCN: ["Aéroport El Prat", "Sants", "Centre-ville", "Port Vell"],
};
const GENERIC_STATIONS = ["Aéroport", "Gare centrale", "Centre-ville", "Port"];

export function mockCars(p: CarSearchParams): CarOffer[] {
  const days = nightsBetween(p.from, p.to);
  const stations = STATIONS[p.pickup.toUpperCase()] ?? GENERIC_STATIONS;
  const rnd = mulberry32(hashString(`${p.pickup}${p.from}${p.to}`));
  const cars: CarOffer[] = [];
  let i = 0;
  for (const category of CAR_CATEGORIES) {
    const models = MODELS[category];
    const n = category === "Utilitaire" || category === "Cabriolet" ? 2 : 3;
    for (let k = 0; k < n; k++) {
      const model = models[(k + Math.floor(rnd() * models.length)) % models.length];
      const automatic = category === "Électrique" || rnd() < (category === "Citadine" ? 0.3 : 0.6);
      const perDay = Math.round(BASE_PRICE[category] * (0.85 + rnd() * 0.5) + (automatic ? 6 : 0));
      const [seats, bags] = SEATS[category];
      cars.push({
        id: `car-${p.pickup}-${i++}`,
        model: `${model} ou similaire`,
        category,
        transmission: automatic ? "Automatique" : "Manuelle",
        seats,
        bags,
        electric: category === "Électrique",
        supplier: SUPPLIERS[Math.floor(rnd() * SUPPLIERS.length)],
        rating: Math.round((4.2 + rnd() * 0.75) * 10) / 10,
        reviews: 30 + Math.floor(rnd() * 900),
        pricePerDay: perDay,
        days,
        total: perDay * days,
        currency: "EUR",
        freeCancel: rnd() < 0.7,
        unlimitedKm: rnd() < 0.55,
        pickup: `${p.pickupName} — ${stations[Math.floor(rnd() * stations.length)]}`,
        bookingUrl: `https://www.rentalcars.com/?location=${encodeURIComponent(p.pickupName)}&from=${p.from}&to=${p.to}`,
      });
    }
  }
  return cars;
}

export async function searchCars(p: CarSearchParams): Promise<CarSearchResult> {
  const cars = mockCars(p).sort((a, b) => a.total - b.total);
  return { cars, source: "mock" };
}
