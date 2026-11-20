import { Suspense } from 'react';
import ThreadEdit from '@/components/forum/threadedit';

export const metadata = {
  title: 'Ubah Thread',
  robots: { index: false, follow: false },
};

async function EditContent({ params }) {
  const { id } = await params;
  return <ThreadEdit id={id} />;
}

export default function EditThreadPage({ params }) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl px-4 py-10" aria-busy="true"><div className="h-60 skeleton rounded" /></div>}>
      <EditContent params={params} />
    </Suspense>
  );
}
