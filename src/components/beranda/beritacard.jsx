import Link from 'next/link';

const dateFormat = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Jakarta',
});

//Tanggal pendek untuk kartu, mis. "18 Okt 2026"
export function formatShortDate(iso) {
  if (!iso) return '';
  return dateFormat.format(new Date(iso));
}

//Ringkasan isi berita: paragraf pertama, dipotong kalau terlalu panjang
//Tanda Markdown dibuang supaya ringkasan terbaca sebagai teks biasa. Link tinggal teksnya
export function makeExcerpt(body, maxLength = 140) {
  if (!body) return '';
  const firstParagraph = body
    .trim()
    .split(/\n\s*\n/)[0]
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`#>~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (firstParagraph.length <= maxLength) return firstParagraph;
  return `${firstParagraph.slice(0, maxLength).trimEnd()}...`;
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </svg>
  );
}

//Kartu berita beranda. Seluruh kartu bisa diklik dan punya efek hover seperti kartu katalog.
//href kosong berarti mode preview (tanpa link)
export default function BeritaCard({ imageUrl, category, date, author, title, excerpt, href }) {
  const cardClass =
    'group flex h-full flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-orange-300 hover:shadow-card-hover';

  const content = (
    <>
      <div className="relative aspect-[2/1] overflow-hidden bg-neutral-200">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-sm text-slate-500">Belum ada foto</span>
        )}
        {category && (
          <span className="absolute left-2 top-2 rounded bg-white px-2 py-0.5 text-xs font-bold text-slate-900">
            {category}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="flex items-center gap-1.5 text-xs text-slate-600">
          <CalendarIcon />
          {date || 'Belum terbit'}
          {author && ` • ${author}`}
        </p>
        <h3 className={`mt-1 text-base font-bold leading-snug transition-colors group-hover:text-orange-600 ${title ? 'text-slate-900' : 'text-slate-400'}`}>
          {title || 'Judul berita'}
        </h3>
        <p className={`mt-1.5 line-clamp-2 text-sm ${excerpt ? 'text-slate-700' : 'text-slate-400'}`}>
          {excerpt || 'Ringkasan isi berita akan tampil di sini.'}
        </p>
        <span className="mt-auto pt-3 text-xs font-bold text-orange-600">Baca Selengkapnya →</span>
      </div>
    </>
  );

  //Kartu dengan link adalah satu tautan penuh (tidak ada link di dalam link)
  if (href) {
    return (
      <Link href={href} className={`${cardClass} block`}>
        {content}
      </Link>
    );
  }

  return <article className={cardClass}>{content}</article>;
}
