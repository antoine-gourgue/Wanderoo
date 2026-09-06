import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import FavoriteCard from "@/components/FavoriteCard";
import Header from "@/components/Header";
import { getFavorites } from "@/lib/favorites";

export default async function FavorisPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  const favorites = await getFavorites();

  return (
    <>
      <Header />
      <main className="wrap list-page">
        <h1>Mes favoris</h1>
        {favorites.length === 0 ? (
          <div className="empty">
            <p>Vous n&apos;avez pas encore de favori.</p>
            <Link href="/" className="empty-cta">
              Explorer les destinations
            </Link>
          </div>
        ) : (
          <div className="grid">
            {favorites.map((f) => (
              <FavoriteCard key={f.id} slug={f.slug} label={f.label} imageUrl={f.imageUrl} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
