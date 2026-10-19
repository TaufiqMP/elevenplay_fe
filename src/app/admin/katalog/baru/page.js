import AccountForm from '@/components/admin/katalog/accountform';

export const metadata = {
  title: 'Tambah Katalog | Admin',
  robots: { index: false, follow: false },
};

// Perlindungan login ditangani app/admin/layout.js (AdminGuard)
export default function TambahAkunPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
      <AccountForm />
    </div>
  );
}