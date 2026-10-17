import Hero from "@/components/beranda/hero";
import KatalogSection from "@/components/beranda/katalogsection";
import BeritaSection from "@/components/beranda/beritasection";
import JadwalSection from "@/components/beranda/jadwalsection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <KatalogSection />
      <BeritaSection />
      <JadwalSection />
    </>
  );
}