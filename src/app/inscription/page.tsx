"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthShell from "@/components/AuthShell";

export default function InscriptionPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        setLoading(false);
        return;
      }
      await signIn("credentials", { email, password, redirect: false });
      router.push("/compte");
      router.refresh();
    } catch {
      setError("Impossible de créer le compte pour le moment.");
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Créer un compte" sub="Gratuit. Enregistrez vos destinations et recevez les baisses de prix.">
      {error ? <div className="auth-err">{error}</div> : null}
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="name">Prénom (facultatif)</label>
          <input
            id="name"
            type="text"
            autoComplete="given-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Antoine"
          />
        </div>
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
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8 caractères minimum"
          />
        </div>
        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? "Création…" : "Créer mon compte"}
        </button>
      </form>
      <p className="auth-alt">
        Déjà un compte ? <Link href="/connexion">Se connecter</Link>
      </p>
    </AuthShell>
  );
}
