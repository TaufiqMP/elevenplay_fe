import BeritaForm from '@/components/admin/berita/beritaform';

export const metadata = {
  title: 'Tambah Berita | Admin',
  robots: { index: false, follow: false },
};

// Perlindungan login ditangani app/admin/layout.js (AdminGuard)
export default function TambahBeritaPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
      <BeritaForm />
    </div>
  );
}
