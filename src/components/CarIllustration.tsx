import type { CarCategory } from "@/lib/cars";

/** Silhouettes de véhicules (vue de profil) : placeholders honnêtes en attendant les photos partenaires. */
const SHAPES: Record<"hatch" | "sedan" | "suv" | "van" | "cabrio", { body: string; glass: string }> = {
  hatch: {
    body: "M18 84V66q0-10 12-12l26-18q6-4 16-4h50q14 0 22 10l18 16q18 4 20 14v12Z",
    glass: "M60 40h20v18H44q4-10 16-18Zm28 0h34l14 18H88Z",
  },
  sedan: {
    body: "M12 84V68q0-8 10-10l22-16q6-4 14-4h54q12 0 20 8l14 12h20q14 2 16 12v14Z",
    glass: "M56 42h22v16H40q4-9 16-16Zm30 0h34l12 16H86Z",
  },
  suv: {
    body: "M14 86V58q0-8 8-10l20-16q6-4 14-4h60q12 0 20 8l16 12q18 2 20 12v26Z",
    glass: "M52 34h26v18H36q4-10 16-18Zm34 0h36l16 18H86Z",
  },
  van: {
    body: "M14 88V40q0-8 8-8h100q10 0 16 8l24 24q4 4 4 12v12Z",
    glass: "M28 40h52v22H28Zm62 0h30l18 22h-48Z",
  },
  cabrio: {
    body: "M14 84V68q0-8 10-10h36l18-14q6-4 12-4h6v14q0 4 4 4h52l6 6h14q12 2 14 12v8Z",
    glass: "M84 42h10l16 12H80Z",
  },
};

const CATEGORY_SHAPE: Record<CarCategory, keyof typeof SHAPES> = {
  Citadine: "hatch",
  Compacte: "hatch",
  Électrique: "hatch",
  Berline: "sedan",
  SUV: "suv",
  Monospace: "suv",
  Utilitaire: "van",
  Cabriolet: "cabrio",
};

export const CATEGORY_TINT: Record<CarCategory, string> = {
  Citadine: "#EEF3F8",
  Compacte: "#EEF6EE",
  Berline: "#F3EEF8",
  SUV: "#F8F2EA",
  Monospace: "#EEF6F6",
  Utilitaire: "#F3F3F3",
  Électrique: "#EAF7EE",
  Cabriolet: "#FBEFEF",
};

export default function CarIllustration({ category, className }: { category: CarCategory; className?: string }) {
  const s = SHAPES[CATEGORY_SHAPE[category]];
  return (
    <svg viewBox="0 0 200 120" className={className} aria-hidden="true">
      <ellipse cx="100" cy="104" rx="78" ry="5" fill="rgba(0,0,0,0.06)" />
      <path d={s.body} fill="#4B5563" />
      <path d={s.glass} fill="#DCE5EF" />
      <rect x="18" y="72" width="12" height="4" rx="2" fill="#F5D67A" />
      <rect x="170" y="72" width="12" height="4" rx="2" fill="#E57373" />
      <g fill="#222">
        <circle cx="56" cy="86" r="14" />
        <circle cx="146" cy="86" r="14" />
      </g>
      <g fill="#9CA3AF">
        <circle cx="56" cy="86" r="6" />
        <circle cx="146" cy="86" r="6" />
      </g>
      {category === "Électrique" ? (
        <path d="M104 52l-10 16h8l-4 14 12-18h-8l4-12Z" fill="#22A06B" />
      ) : null}
    </svg>
  );
}
