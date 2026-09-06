import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AlertRow from "@/components/AlertRow";
import Header from "@/components/Header";
import { getAlerts } from "@/lib/alerts";
import { cityName } from "@/lib/format";

const TYPE_LABEL: Record<string, string> = {
  FLIGHT: "Vol",
  HOTEL: "Hôtel",
  CAR: "Location de voiture",
};

export default async function AlertesPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  const alerts = await getAlerts();

  return (
    <>
      <Header />
      <main className="wrap list-page">
        <h1>Mes alertes prix</h1>
        {alerts.length === 0 ? (
          <div className="empty">
            <p>Aucune alerte pour l&apos;instant.</p>
            <Link href="/recherche?type=vol&from=PAR&to=LIS&depart=2026-03-12&return=2026-03-16&pax=1" className="empty-cta">
              Lancer une recherche
            </Link>
          </div>
        ) : (
          <div className="alerts">
            {alerts.map((a) => (
              <AlertRow
                key={a.id}
                id={a.id}
                title={`${a.origin ? `${cityName(a.origin)} → ` : ""}${cityName(a.destination)}`}
                sub={TYPE_LABEL[a.type] ?? a.type}
                price={a.lastPrice ?? undefined}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
