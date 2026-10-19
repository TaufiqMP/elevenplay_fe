'use client';

import { useEffect, useState } from 'react';
import { getAdminAccount } from '@/api/adminaccounts';
import AccountForm from './accountform';

export default function AccountEditor({ accountId }) {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let isMounted = true;

    getAdminAccount(accountId)
      .then((data) => {
        if (isMounted) setAccount(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Gagal memuat data akun.');
      });

    return () => {
      isMounted = false;
    };
  }, [accountId, retry]);

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

  if (!account) {
    return <div className="h-16 animate-pulse rounded-md bg-slate-100" aria-busy="true" aria-label="Memuat akun" />;
  }

  return <AccountForm initialAccount={account} />;
}
