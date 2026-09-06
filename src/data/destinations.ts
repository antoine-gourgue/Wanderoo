export type Destination = {
  slug: string;
  image: string;
  /** Libellé complet, utilisé pour les favoris et l'alt. */
  city: string;
  /** Ligne 1 façon Airbnb : « Type · Ville ». */
  title: string;
  /** Ligne 2 : dates · détail. */
  line2: string;
  /** Ligne 3 : prix total. */
  price: string;
  rating: string;
  badge?: string;
};

export const popularFlights: Destination[] = [
  { slug: "amsterdam", image: "/destinations/amsterdam.jpg", city: "Amsterdam, Pays-Bas", title: "Vol direct · Amsterdam", line2: "12–16 mars · Aller-retour", price: "44 € au total", rating: "4,88", badge: "Coup de cœur voyageurs" },
  { slug: "new-york", image: "/destinations/newyork.jpg", city: "New York, États-Unis", title: "Vol direct · New York", line2: "3–12 avr. · Aller-retour", price: "318 € au total", rating: "4,79" },
  { slug: "reykjavik", image: "/destinations/reykjavik.jpg", city: "Reykjavík, Islande", title: "Vol direct · Reykjavík", line2: "20–27 mars · Aller-retour", price: "176 € au total", rating: "4,86", badge: "Coup de cœur voyageurs" },
  { slug: "yosemite", image: "/destinations/yosemite.jpg", city: "Yosemite, Californie", title: "1 escale · San Francisco", line2: "5–18 mai · Aller-retour", price: "402 € au total", rating: "4,84" },
  { slug: "lofoten", image: "/destinations/lofoten.jpg", city: "Lofoten, Norvège", title: "1 escale · Bodø", line2: "14–20 juil. · Aller-retour", price: "289 € au total", rating: "4,97", badge: "Coup de cœur voyageurs" },
  { slug: "dolomites", image: "/destinations/promo.jpg", city: "Dolomites, Italie", title: "Vol direct · Venise", line2: "2–9 juin · Aller-retour", price: "98 € au total", rating: "4,91" },
  { slug: "highlands", image: "/destinations/highlands.jpg", city: "Highlands, Écosse", title: "Vol direct · Édimbourg", line2: "1–6 juin · Aller-retour", price: "121 € au total", rating: "4,90" },
  { slug: "amalfi", image: "/destinations/amalfi.jpg", city: "Amalfi, Italie", title: "Vol direct · Naples", line2: "12–16 mars · Aller-retour", price: "87 € au total", rating: "4,92", badge: "Coup de cœur voyageurs" },
];

export const favStays: Destination[] = [
  { slug: "stay-amalfi", image: "/destinations/amalfi.jpg", city: "Amalfi, Italie", title: "Vol + hôtel · Amalfi", line2: "12–16 mars · 4 nuits", price: "312 € au total", rating: "4,92", badge: "Coup de cœur voyageurs" },
  { slug: "stay-chamonix", image: "/destinations/chamonix.jpg", city: "Chamonix, France", title: "Train + chalet · Chamonix", line2: "8–11 févr. · 3 nuits", price: "189 € au total", rating: "4,95" },
  { slug: "stay-highlands", image: "/destinations/highlands.jpg", city: "Highlands, Écosse", title: "Vol + voiture · Highlands", line2: "1–6 juin · 5 jours", price: "241 € au total", rating: "4,90", badge: "Coup de cœur voyageurs" },
  { slug: "stay-lofoten", image: "/destinations/lofoten.jpg", city: "Lofoten, Norvège", title: "Vol + voiture · Lofoten", line2: "14–20 juil. · 6 jours", price: "289 € au total", rating: "4,97" },
  { slug: "stay-dolomites", image: "/destinations/promo.jpg", city: "Dolomites, Italie", title: "Vol + refuge · Dolomites", line2: "2–9 juin · 7 nuits", price: "356 € au total", rating: "4,93", badge: "Coup de cœur voyageurs" },
  { slug: "stay-amsterdam", image: "/destinations/amsterdam.jpg", city: "Amsterdam, Pays-Bas", title: "Vol + hôtel · Amsterdam", line2: "12–16 mars · 3 nuits", price: "264 € au total", rating: "4,88" },
  { slug: "stay-reykjavik", image: "/destinations/reykjavik.jpg", city: "Reykjavík, Islande", title: "Vol + voiture · Islande", line2: "20–27 mars · 7 jours", price: "612 € au total", rating: "4,86" },
  { slug: "stay-newyork", image: "/destinations/newyork.jpg", city: "New York, États-Unis", title: "Vol + hôtel · New York", line2: "3–12 avr. · 5 nuits", price: "894 € au total", rating: "4,79", badge: "Coup de cœur voyageurs" },
];
