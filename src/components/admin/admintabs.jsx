'use client';

import { useState } from 'react';
import { BallIcon, CalendarIcon, GearIcon, NewsIcon, ShieldIcon, TrashIcon } from '@/components/admin/icons';
import SampahManager from '@/components/admin/sampah/sampahmanager';
import BeritaManager from '@/components/admin/berita/beritamanager';
import KatalogManager from '@/components/admin/katalog/katalogmanager';
import JadwalManager from '@/components/admin/jadwal/jadwalmanager';
import PengaturanManager from '@/components/admin/pengaturan/pengaturanmanager';
import ForumModeration from '@/components/admin/forum/forummoderation';

 
function Placeholder({ title }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
      {title} belum dibuat.
    </div>
  );
}
 
// Tambah tab baru cukup menambah satu item di array ini.
// panel berupa fungsi supaya komponennya baru dibuat saat tab itu dipilih.
const TABS = [
  { id: 'berita', label: 'Kelola Berita Beranda', icon: NewsIcon, panel: () => <BeritaManager /> },
  { id: 'katalog', label: 'Kelola E-Katalog Skuad', icon: BallIcon, panel: () => <KatalogManager /> },
  { id: 'jadwal', label: 'Kelola Jadwal', icon: CalendarIcon, panel: () => <JadwalManager /> },
  { id: 'forum', label: 'Moderasi Forum', icon: ShieldIcon, panel: () => <ForumModeration /> },
  { id: 'pengaturan', label: 'Pengaturan', icon: GearIcon, panel: () => <PengaturanManager /> },
  { id: 'sampah', label: 'Sampah', icon: TrashIcon, panel: () => <SampahManager /> },
];
 
export default function AdminTabs() {
  const [active, setActive] = useState('berita');
  const current = TABS.find((t) => t.id === active);
 
  return (
    <div>
      <div
        role="tablist"
        aria-label="Menu admin"
        className="inline-flex max-w-full gap-2 overflow-x-auto rounded-2xl border  border-slate-300 bg-white p-2"
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const selected = id === active;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={selected}
              aria-controls={`panel-${id}`}
              onClick={() => setActive(id)}
              className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border px-5 py-2.5 font-semibold transition-all duration-300 focus-visible:outline-2 focus-visible:outline-orange-600 ${
                selected
                  ? 'border-orange-500 bg-orange-500 text-white'
                  : 'border-slate-300 bg-white text-slate-800 hover:border-orange-400'
              }`}
            >
              <Icon />
              {label}
            </button>
          );
        })}
      </div>
 
      <div
        role="tabpanel"
        id={`panel-${current.id}`}
        aria-labelledby={`tab-${current.id}`}
        className="mt-6"
      >
        {current.panel()}
      </div>
    </div>
  );
}