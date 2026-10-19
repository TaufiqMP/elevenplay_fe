'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/supabase';

export default function AdminGuard({ children }) {
  const router = useRouter();
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let isMounted = true;

    const checkAccess = (session) => {
      if (!isMounted) return;

      if (!session) {
        setStatus('redirecting');
        router.replace('/login');
        return;
      }

      if (session.user.app_metadata?.role === 'admin') {
        setStatus('authorized');
        return;
      }

      setStatus('redirecting');
      router.replace('/');
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      checkAccess(session);
    });

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) throw error;
        checkAccess(data.session);
      })
      .catch((error) => {
        if (!isMounted) return;
        console.error('Gagal memverifikasi akses admin:', error);
        setStatus('error');
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (status === 'authorized') return children;

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 text-center text-slate-700 sm:px-6 lg:px-8">
      {status === 'error'
        ? 'Gagal memverifikasi akses admin. Muat ulang halaman untuk mencoba lagi.'
        : 'Memverifikasi akses admin...'}
    </div>
  );
}
