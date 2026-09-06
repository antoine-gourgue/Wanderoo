import CardRow from "@/components/CardRow";
import DestinationCard from "@/components/DestinationCard";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { favStays, popularFlights } from "@/data/destinations";
import { getFavoriteSlugs } from "@/lib/favorites";

export default async function Home() {
  const favs = await getFavoriteSlugs();
  return (
    <>
      <Header />
      <main className="wrap home">
        <CardRow title="Vols populaires · Paris">
          {popularFlights.map((d) => (
            <DestinationCard key={d.slug} d={d} saved={favs.has(d.slug)} />
          ))}
        </CardRow>

        <CardRow title="Séjours coup de cœur pour votre prochain voyage">
          {favStays.map((d) => (
            <DestinationCard key={d.slug} d={d} saved={favs.has(d.slug)} />
          ))}
        </CardRow>
      </main>
      <Footer />
    </>
  );
}
