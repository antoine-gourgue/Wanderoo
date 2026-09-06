import Image from "next/image";

/** Galerie façon fiche Airbnb : 1 grande photo + 4 petites (2×2), gaps 8px, bloc r12. */
export default function HotelGallery({ images, name }: { images: string[]; name: string }) {
  const pics = [0, 1, 2, 3, 4].map((i) => images[i % images.length]);
  return (
    <div className="gal">
      {pics.map((src, i) => (
        <div className={`gal-cell${i === 0 ? " gal-main" : ""}`} key={`${src}-${i}`}>
          <Image src={src} alt={`${name} — photo ${i + 1}`} fill sizes={i === 0 ? "560px" : "272px"} priority={i === 0} />
        </div>
      ))}
      <button type="button" className="gal-more">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
          <rect x="3" y="3" width="8" height="8" rx="1" />
          <rect x="13" y="3" width="8" height="8" rx="1" />
          <rect x="3" y="13" width="8" height="8" rx="1" />
          <rect x="13" y="13" width="8" height="8" rx="1" />
        </svg>
        Afficher toutes les photos
      </button>
    </div>
  );
}
