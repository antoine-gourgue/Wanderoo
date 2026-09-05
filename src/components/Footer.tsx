const COLS: { title: string; links: string[] }[] = [
  {
    title: "Assistance",
    links: ["Centre d'aide", "Annuler une réservation", "Signaler un problème", "Nous contacter"],
  },
  {
    title: "Découvrir",
    links: ["Vols pas chers", "Hôtels", "Location de voiture", "Alertes prix"],
  },
  {
    title: "Wanderoo",
    links: ["À propos", "Comment on se finance", "Partenaires affiliés", "Recrutement"],
  },
  {
    title: "Restons en contact",
    links: ["Newsletter bons plans", "Instagram", "TikTok", "X (Twitter)"],
  },
];

export default function Footer() {
  return (
    <footer className="site">
      <div className="wrap">
        <div className="foot-top">
          {COLS.map((col) => (
            <div className="fcol" key={col.title}>
              <h5>{col.title}</h5>
              {col.links.map((l) => (
                <a href="#" key={l}>
                  {l}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className="foot-bar">
          <span>© 2026 Wanderoo</span>
          <span className="sep">·</span>
          <a href="#">Confidentialité</a>
          <span className="sep">·</span>
          <a href="#">CGU</a>
          <span className="sep">·</span>
          <a href="#">Plan du site</a>
          <span className="right">
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
              </svg>
              Français (FR)
            </span>
            <span>€ EUR</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
