'use client';

import { useEffect, useState } from 'react';
import { getSettings } from '@/api/settings';

//Simpan hasil sekali per halaman, supaya banyak kartu tidak memanggil /settings berkali-kali
let cachedRequest = null;

//Panggil setelah admin mengubah pengaturan, supaya data berikutnya diambil ulang
export function clearSettingsCache() {
  cachedRequest = null;
}

//Pengaturan (akun TikTok, nomor WA) untuk komponen client. null selama belum termuat atau gagal
export function useSettings() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let active = true;
    if (!cachedRequest) cachedRequest = getSettings().catch(() => null);

    cachedRequest.then((data) => {
      if (active) setSettings(data);
    });

    return () => {
      active = false;
    };
  }, []);

  return settings;
}
