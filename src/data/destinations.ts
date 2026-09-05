export type Destination = {
  slug: string;
  image: string;
  city: string;
  rating: string;
  sub: string;
  dates: string;
  price: string;
  priceUnit: string;
  badge?: string;
};

export const flightsFromParis: Destination[] = [
  {
    slug: "amsterdam",
    image: "/destinations/amsterdam.jpg",
    city: "Amsterdam, Pays-Bas",
    rating: "4,88",
    sub: "Vol direct · 1h20",
    dates: "12 – 16 mars",
    price: "44€",
    priceUnit: "l'aller-retour",
  },
  {
    slug: "new-york",
    image: "/destinations/newyork.jpg",
    city: "New York, États-Unis",
    rating: "4,79",
    sub: "Vol direct · 8h10",
    dates: "3 – 12 avril",
    price: "318€",
    priceUnit: "l'aller-retour",
  },
  {
    slug: "reykjavik",
    image: "/destinations/reykjavik.jpg",
    city: "Reykjavík, Islande",
    rating: "4,86",
    sub: "Vol direct · 3h30",
    dates: "20 – 27 mars",
    price: "176€",
    priceUnit: "l'aller-retour",
  },
  {
    slug: "yosemite",
    image: "/destinations/yosemite.jpg",
    city: "Yosemite, Californie",
    rating: "4,84",
    sub: "1 escale · 13h05",
    dates: "5 – 18 mai",
    price: "402€",
    priceUnit: "l'aller-retour",
  },
];

export const favStays: Destination[] = [
  {
    slug: "amalfi",
    image: "/destinations/amalfi.jpg",
    city: "Amalfi, Italie",
    rating: "4,92",
    sub: "Vol + hôtel · 4 nuits",
    dates: "12 – 16 mars",
    price: "312€",
    priceUnit: "par personne",
    badge: "Coup de cœur voyageurs",
  },
  {
    slug: "chamonix",
    image: "/destinations/chamonix.jpg",
    city: "Chamonix, France",
    rating: "4,95",
    sub: "Train + chalet · 3 nuits",
    dates: "8 – 11 février",
    price: "189€",
    priceUnit: "par personne",
  },
  {
    slug: "highlands",
    image: "/destinations/highlands.jpg",
    city: "Highlands, Écosse",
    rating: "4,90",
    sub: "Vol + voiture · 5 jours",
    dates: "1 – 6 juin",
    price: "241€",
    priceUnit: "par personne",
  },
  {
    slug: "lofoten",
    image: "/destinations/lofoten.jpg",
    city: "Lofoten, Norvège",
    rating: "4,97",
    sub: "Vol + voiture · 6 jours",
    dates: "14 – 20 juillet",
    price: "289€",
    priceUnit: "par personne",
    badge: "Coup de cœur voyageurs",
  },
];
