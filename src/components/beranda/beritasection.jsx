import { Suspense } from "react";
import SectionHeading from "@/components/ui/sectionheading";
import BeritaCard, { formatShortDate, makeExcerpt } from "@/components/beranda/beritacard";
import { getContents } from "@/api/contents";

const TITLE = "Berita & Info Terbaru!";
const SUBTITLE = "Cari info seputar e-football dan forum lainnya!";

async function fetchBerita() {
  try {
    const res = await getContents({ page: 1, limit: 6 });
    return res.data ?? [];
  } catch {
    // Kalau API down, beranda tetap tampil (section berita menampilkan pesan kosong)
    return [];
  }
}

async function BeritaContent() {
  const berita = await fetchBerita();

  return (
    <section className="mx-auto max-w-6xl px-4 pb-20">
      <SectionHeading title={TITLE} subtitle={SUBTITLE} />

      {berita.length === 0 ? (
        <p className="mt-6 rounded-md border border-dashed border-slate-300 p-8 text-center text-slate-600">
          Belum ada berita terbaru.
        </p>
      ) : (
        <div className="-mx-4 mt-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4">
          {berita.map((item) => (
            <div key={item.id} className="flex h-[384px] w-[78%] shrink-0 snap-start sm:w-[320px]">
              <BeritaCard
                imageUrl={item.cover_image_url}
                category={item.category}
                date={formatShortDate(item.published_at)}
                author={item.author}
                title={item.title}
                excerpt={makeExcerpt(item.body)}
                href={`/berita/${item.slug}`}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function BeritaFallback() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20">
      <SectionHeading title={TITLE} subtitle={SUBTITLE} />

      <div aria-label="Memuat berita" className="-mx-4 mt-6 flex gap-6 overflow-x-auto px-4 pb-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-[384px] w-[78%] shrink-0 skeleton rounded-md sm:w-[320px]" />
        ))}
      </div>
    </section>
  );
}

export default function BeritaSection() {
  return (
    <Suspense fallback={<BeritaFallback />}>
      <BeritaContent />
    </Suspense>
  );
}
