import Link from "next/link";

export default function AuthShell({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="auth-wrap">
      <div className="auth-brand">
        <Link className="logo" href="/" aria-label="Wanderoo, accueil">
          <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" width={32} height={32}>
            <path
              d="M16 2c-5 0-9 3.9-9 9 0 6.2 7.4 12.9 8.4 13.7a.9.9 0 0 0 1.2 0C17.6 23.9 25 17.2 25 11c0-5.1-4-9-9-9Z"
              fill="var(--rausch)"
            />
            <circle cx="16" cy="11" r="3.4" fill="#fff" />
          </svg>
          <span className="word">wanderoo</span>
        </Link>
      </div>
      <div className="auth-card">
        <h1>{title}</h1>
        {sub ? <p className="sub">{sub}</p> : null}
        {children}
      </div>
    </div>
  );
}
