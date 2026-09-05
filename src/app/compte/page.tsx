import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Header from "@/components/Header";
import LogoutButton from "@/components/LogoutButton";

export default async function ComptePage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const { email, name } = session.user;
  const initial = (name ?? email ?? "?").charAt(0).toUpperCase();

  return (
    <>
      <Header />
      <main className="wrap account">
        <div className="account-head">
          <span className="account-ava">{initial}</span>
          <div>
            <h1>{name ? `Bonjour, ${name}` : "Mon compte"}</h1>
            <p>{email}</p>
          </div>
        </div>

        <div className="account-grid">
          <Link href="/" className="account-tile">
            <h3>Mes favoris</h3>
            <p>Les destinations que vous avez mises de côté.</p>
          </Link>
          <Link href="/" className="account-tile">
            <h3>Mes alertes prix</h3>
            <p>On vous prévient dès qu&apos;un trajet baisse.</p>
          </Link>
          <Link href="/" className="account-tile">
            <h3>Recherches sauvegardées</h3>
            <p>Reprenez une comparaison en un clic.</p>
          </Link>
        </div>

        <LogoutButton />
      </main>
    </>
  );
}
