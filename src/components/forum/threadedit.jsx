'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMyThread } from '@/api/forum';
import ThreadForm from './threadform';

//Ambil thread milik sendiri, lalu tampilkan form ubah
export default function ThreadEdit({ id }) {
  const [thread, setThread] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getMyThread(id)
      .then((data) => {
        if (active) setThread(data);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Gagal memuat thread.');
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p role="alert" className="text-red-800">{error}</p>
        <Link href="/forum/saya" className="mt-4 inline-block font-bold text-orange-600 hover:underline">
          Kembali ke Thread Saya
        </Link>
      </div>
    );
  }

  if (!thread) {
    return <div className="mx-auto max-w-4xl px-4 py-10" aria-busy="true"><div className="h-60 skeleton rounded" /></div>;
  }

  return <ThreadForm thread={thread} />;
}
