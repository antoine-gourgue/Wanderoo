import { airlineName, type FlightOffer } from "@/lib/travelpayouts";

export type ChipGroup = "stops" | "time" | "price" | "duration" | "airline";

export type Chip = {
  id: string;
  label: string;
  group: ChipGroup;
  test: (o: FlightOffer) => boolean;
};

/** [min, max] en euros, ou null si la fourchette complète est sélectionnée. */
export type PriceRange = [number, number] | null;

export const hourOf = (iso: string): number => Number(iso.match(/T(\d{2})/)?.[1] ?? 0);

export const BASE_CHIPS: Chip[] = [
  { id: "direct", label: "Direct", group: "stops", test: (o) => o.transfers === 0 },
  { id: "max1", label: "1 escale max", group: "stops", test: (o) => o.transfers <= 1 },
  { id: "stops2", label: "2 escales et plus", group: "stops", test: (o) => o.transfers >= 2 },
  { id: "morning", label: "Matin", group: "time", test: (o) => hourOf(o.departAt) < 12 },
  { id: "afternoon", label: "Après-midi", group: "time", test: (o) => hourOf(o.departAt) >= 12 && hourOf(o.departAt) < 18 },
  { id: "evening", label: "Soir", group: "time", test: (o) => hourOf(o.departAt) >= 18 },
  { id: "lt100", label: "Moins de 100 €", group: "price", test: (o) => o.price < 100 },
  { id: "lt200", label: "Moins de 200 €", group: "price", test: (o) => o.price < 200 },
  { id: "lt3h", label: "Moins de 3 h", group: "duration", test: (o) => o.durationMin < 180 },
  { id: "lt6h", label: "Moins de 6 h", group: "duration", test: (o) => o.durationMin < 360 },
];

/** Chips affichés dans la barre horizontale (la modale montre tout). */
export const ROW_CHIP_IDS = new Set(["direct", "max1", "morning", "afternoon", "evening", "lt100", "lt200"]);

export function airlineChips(offers: FlightOffer[]): Chip[] {
  const codes = [...new Set(offers.map((o) => o.airline))];
  return codes.map((a) => ({
    id: `al-${a}`,
    label: airlineName(a),
    group: "airline",
    test: (o: FlightOffer) => o.airline === a,
  }));
}

/**
 * Une offre passe si, pour chaque groupe ayant au moins un chip actif,
 * elle satisfait l'un d'eux (OU dans le groupe, ET entre groupes),
 * et si son prix est dans la fourchette.
 */
export function matches(o: FlightOffer, active: Set<string>, price: PriceRange, chips: Chip[]): boolean {
  if (price && (o.price < price[0] || o.price > price[1])) return false;
  const byGroup = new Map<ChipGroup, Chip[]>();
  for (const c of chips) {
    if (!active.has(c.id)) continue;
    const list = byGroup.get(c.group) ?? [];
    list.push(c);
    byGroup.set(c.group, list);
  }
  for (const list of byGroup.values()) {
    if (!list.some((c) => c.test(o))) return false;
  }
  return true;
}
