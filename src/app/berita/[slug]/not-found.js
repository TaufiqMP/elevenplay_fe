import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-extrabold text-slate-900">Berita Tidak Ditemukan</h1>
      <p className="mt-2 text-slate-600">
        Berita yang kamu cari tidak ada, sudah diarsipkan, atau belum ditayangkan.
      </p>
      <Link href="/" className="mt-6 inline-block font-bold text-orange-600 hover:underline">
        Kembali ke Beranda
      </Link>
    </div>
  );
}
