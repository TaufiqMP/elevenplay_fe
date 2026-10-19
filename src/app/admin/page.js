import AdminTabs from '@/components/admin/admintabs';

export const metadata = {
  title: 'Pusat Kendali Admin',
  robots: { index: false, follow: false }, // jangan masuk hasil pencarian Google
};

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <h1 className="text-3xl font-extrabold text-slate-900 sm:text-5xl">
        Pusat Kendali Admin - Elevenplay.id
      </h1>
      <p className="mt-2 mb-8 text-lg text-slate-700">
        Kelola konten informasi Beranda, data E-Katalog, serta pantau dan moderasi Forum Komunitas.
      </p>

      {/* TODO: jumlah moderasi forum diambil dari API */}
      <AdminTabs forumPending={12} />
    </div>
  );
}