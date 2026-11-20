'use client';

import React from 'react';
import Link from 'next/link';
import { useSettings } from '@/components/ui/usesettings';

const WA_MESSAGE = encodeURIComponent('Halo Admin Elevenplay, saya ingin konsultasi transaksi aman');

export default function Footer() {
  //Akun TikTok dan nomor WA diambil dari Pengaturan admin
  const settings = useSettings();

  return (
    <footer className="bg-white border-t border-slate-200 mt-16 text-slate-600">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Kolom 1: Brand & Penjelasan */}
          <div className="space-y-3">
            <Link href="/" className="inline-block text-xl font-black text-slate-900 tracking-tight">
              Elevenplay<span className="text-orange-500">.id</span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              Platform e-katalog terstruktur dan komunitas digital eFootball Indonesia. Media kurasi akun transparan, rujukan taktik, dan penghubung WhatsApp seller terpercaya.
            </p>
          </div>

          {/* Kolom 2: Sosial Media */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">
              Sosial Media
            </h3>
            <ul className="space-y-2 text-sm">
              {/* Instagram dan TikTok dari Pengaturan, disembunyikan kalau belum diisi */}
              {settings?.instagram_url && (
                <li>
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-orange-600 transition-colors"
                  >
                    Instagram
                  </a>
                </li>
              )}
              {settings?.tiktok_url && (
                <li>
                  <a
                    href={settings.tiktok_url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-orange-600 transition-colors"
                  >
                    Tiktok
                  </a>
                </li>
              )}
              <li>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-orange-600 transition-colors"
                >
                  Youtube
                </a>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Bantuan & Panduan */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">
              Bantuan & Panduan
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="cursor-pointer hover:text-orange-600 transition-colors">
                  Panduan Verifikasi Akun
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-orange-600 transition-colors">
                  Prosedur Transaksi Aman
                </span>
              </li>
              {settings?.whatsapp_url && (
                <li>
                  <a
                    href={`${settings.whatsapp_url}?text=${WA_MESSAGE}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-orange-600 transition-colors font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    Kontak Admin WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Kolom 4: Disclaimer Resmi */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">
              Disclaimer Resmi
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Elevenplay.id tidak berafiliasi, disponsori, atau didukung oleh KONAMI Digital Entertainment. Seluruh nama aset dan gambar adalah hak cipta pemilik terkait. Platform murni sebagai hub komunitas dan pusat inquiry WhatsApp.
            </p>
          </div>
        </div>

        {/* Sub-footer Bar */}
        <div className="border-t border-slate-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© 2026 Elevenplay.id. Hak Cipta Dilindungi.</p>
          <p className="font-medium text-slate-500">Komunitas eFootball Mobile Indonesia</p>
        </div>
      </div>
    </footer>
  );
}
