'use client';

import { useEffect, useState } from 'react';
import BeritaForm from './beritaform';

// API diimpor lazy supaya error inisialisasi Supabase tampil sebagai pesan, bukan crash.
const loadApi = () => import('@/api/admin');

//Ambil berita berdasarkan id, lalu tampilkan form dalam mode ubah
export default function BeritaEditor({ contentId }) {
  const [content, setContent] = useState(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let isMounted = true;

    loadApi()
      .then((api) => api.getAdminContent(contentId))
      .then((data) => {
        if (isMounted) setContent(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Gagal memuat berita.');
      });

    return () => {
      isMounted = false;
    };
  }, [contentId, retry]);

  if (error) {
    return (
      <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-6 text-red-800">
        <p>{error}</p>
        <button
          type="button"
          onClick={() => {
            setError('');
            setRetry((value) => value + 1);
          }}
          className="mt-3 font-bold underline"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  if (!content) {
    return <div className="h-16 skeleton rounded-md" aria-busy="true" aria-label="Memuat berita" />;
  }

  return <BeritaForm initialContent={content} />;
}
