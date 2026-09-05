import CategoryBar from "@/components/CategoryBar";
import DestinationCard from "@/components/DestinationCard";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";
import { favStays, flightsFromParis } from "@/data/destinations";

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="sec-h">
      <h2>{title}</h2>
      <span className="chev" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 6 6 6-6 6" />
        </svg>
      </span>
      <a className="alllink" href="#">
        Tout voir
      </a>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Header />
      <CategoryBar />
      <main className="wrap">
        <section className="sec">
          <SectionHeader title="Vols à petit prix depuis Paris" />
          <div className="grid">
            {flightsFromParis.map((d) => (
              <DestinationCard key={d.slug} d={d} />
            ))}
          </div>
        </section>

        <PromoBanner />

        <section className="sec">
          <SectionHeader title="Séjours coup de cœur" />
          <div className="grid">
            {favStays.map((d) => (
              <DestinationCard key={d.slug} d={d} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
