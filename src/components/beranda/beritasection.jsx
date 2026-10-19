import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/ui/sectionheading";

// Data berita dikirim dari luar lewat prop.
// Nanti, kalau API berita sudah ada, ambil datanya di app/page.js
// (atau jadikan komponen ini async seperti KatalogSection) lalu kirim ke sini.
export default function BeritaSection({ berita = [] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20">
      <SectionHeading
        title="Berita & Info Terbaru!"
        subtitle="Cari info seputar e-football dan forum lainnya!"
      />

      {berita.length === 0 ? (
        <p className="mt-6 rounded-md border border-dashed border-slate-300 p-8 text-center text-slate-600">
          Belum ada berita terbaru.
        </p>
      ) : (
        <div className="-mx-4 mt-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4">
          {berita.map((item) => (
            <article
              key={item.id}
              className="w-[90%] shrink-0 snap-start overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm sm:w-[480px]"
            >
              <div className="relative aspect-[16/8]">
                <Image src={item.image} alt="" fill sizes="480px" className="object-cover" />
                <span className="absolute left-2 top-2 rounded bg-white px-2 py-0.5 text-xs font-bold text-slate-900">
                  {item.tag}
                </span>
              </div>
              <div className="p-5">
                <p className="text-xs text-slate-600">
                  {item.date} • {item.author}
                </p>
                <h3 className="mt-1 text-lg font-bold leading-snug text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-slate-700">{item.desc}</p>
                <Link
                  href={`/forum/${item.slug}`}
                  className="mt-4 inline-block text-xs font-bold text-orange-600 hover:underline"
                >
                  Baca Selengkapnya →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}