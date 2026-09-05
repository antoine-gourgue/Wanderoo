import Image from "next/image";

export default function PromoBanner() {
  return (
    <div className="promo">
      <Image src="/destinations/promo.jpg" alt="" fill sizes="100vw" />
      <div className="promo-in">
        <div className="pk">Alerte prix</div>
        <h3>On surveille, vous voyagez.</h3>
        <p>
          Créez une alerte sur votre trajet : Wanderoo vous prévient dès que le
          prix baisse.
        </p>
        <a className="pbtn" href="#">
          Créer une alerte
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
      </div>
    </div>
  );
}
