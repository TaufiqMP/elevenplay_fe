import { Suspense } from 'react';
import AccountEditor from '@/components/admin/katalog/accounteditor';

export const metadata = {
  title: 'Ubah Katalog | Admin',
  robots: { index: false, follow: false },
};

async function EditAkunContent({ params }) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
      <AccountEditor accountId={id} />
    </div>
  );
}

function EditAkunLoading() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-6 px-4 py-8 sm:px-6 lg:px-8 xl:px-10" aria-busy="true">
      <div className="h-32 animate-pulse rounded-lg bg-slate-100" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_440px]">
        <div className="space-y-6">
          <div className="h-72 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-64 animate-pulse rounded-lg bg-slate-100" />
        </div>
        <div className="h-80 animate-pulse rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}

export default function EditAkunPage({ params }) {
  return (
    <Suspense fallback={<EditAkunLoading />}>
      <EditAkunContent params={params} />
    </Suspense>
  );
}
