"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthShell from "@/components/AuthShell";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
    } else {
      router.push("/compte");
      router.refresh();
    }
  }

  return (
    <AuthShell title="Content de vous revoir" sub="Connectez-vous pour retrouver vos favoris et vos alertes prix.">
      {error ? <div className="auth-err">{error}</div> : null}
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
          />
        </div>
        <div className="field">
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
      <p className="auth-alt">
        Pas encore de compte ? <Link href="/inscription">Créer un compte</Link>
      </p>
    </AuthShell>
  );
}
