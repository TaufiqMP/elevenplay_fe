import { Suspense } from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import { getContentBySlug } from '@/api/contents';
import BeritaGallery from '@/components/berita/beritagallery';
import Markdown from '@/components/forum/markdown';
import { makeExcerpt } from '@/components/beranda/beritacard';

const longDate = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Jakarta',
});

//Ambil berita, null kalau tidak ada. Error selain 404 dilempar lagi
async function fetchBerita(slug) {
  try {
    return await getContentBySlug(slug);
  } catch (err) {
    if (err?.status === 404) return null;
    throw err;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const berita = await fetchBerita(slug);
    if (!berita) return { title: 'Berita Tidak Ditemukan' };
    return {
      title: berita.title,
      description: makeExcerpt(berita.body, 160),
    };
  } catch {
    return { title: 'Berita' };
  }
}

async function BeritaDetailContent({ params }) {
  await connection();
  const { slug } = await params;

  let berita;
  try {
    berita = await fetchBerita(slug);
  } catch {
    return (
      <div role="alert" className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-slate-900">Gagal memuat berita</h1>
        <p className="mt-2 text-slate-600">Terjadi kesalahan saat mengambil data. Coba muat ulang halaman.</p>
        <Link href="/" className="mt-6 inline-block font-bold text-orange-600 hover:underline">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  if (!berita) notFound();

  return (
    <article className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <Link href="/" aria-label="Kembali ke Beranda" className="inline-block text-slate-800 hover:text-orange-600">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </Link>

      <nav aria-label="Breadcrumb" className="mt-1 mb-2 text-lg text-slate-500">
        <Link href="/" className="hover:text-orange-600">Beranda</Link>
        {' > '}
        <span className="text-orange-500">{berita.title}</span>
      </nav>

      <BeritaGallery coverUrl={berita.cover_image_url} gallery={berita.gallery} title={berita.title} />

      <header className="mt-10">
        {berita.category && (
          <span className="inline-block rounded bg-orange-500 px-2.5 py-1 text-xs font-bold text-white">
            {berita.category}
          </span>
        )}
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-4xl">{berita.title}</h1>
        <p className="mt-2 text-lg text-slate-700">
          {berita.published_at && longDate.format(new Date(berita.published_at))}
          {berita.author && ` • ${berita.author}`}
        </p>
      </header>

      {/* Isi berita dalam Markdown (tebal, miring, daftar, link). HTML mentah tidak ditampilkan */}
      <div className="mt-6 sm:mt-8">
        <Markdown>{berita.body ?? ''}</Markdown>
      </div>
    </article>
  );
}

function BeritaDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8" aria-busy="true" aria-label="Memuat berita">
      <div className="h-6 w-64 skeleton rounded" />
      <div className="aspect-[16/7] skeleton" />
      <div className="h-10 w-3/4 skeleton rounded" />
      <div className="h-40 skeleton rounded" />
    </div>
  );
}

export default function BeritaDetailPage({ params }) {
  return (
    <Suspense fallback={<BeritaDetailLoading />}>
      <BeritaDetailContent params={params} />
    </Suspense>
  );
}
