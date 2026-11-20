import { Suspense } from 'react';
import ThreadDetail from '@/components/forum/threaddetail';

async function ThreadContent({ params }) {
  const { slug } = await params;
  return <ThreadDetail slug={slug} />;
}

export default function ThreadPage({ params }) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl px-4 py-10" aria-busy="true"><div className="h-60 skeleton rounded" /></div>}>
      <ThreadContent params={params} />
    </Suspense>
  );
}
