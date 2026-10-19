// SEMUA nama field backend ada di file ini; kalau beda, cukup ubah `key` di sini.
//
// PASTI ada (dari API-mu): title, subtitle, tier_label, main_image_url, gallery, status.
// TEBAKAN dari halaman detail: edition_code, platform, team_strength, epic, big_time,
// showtime, coin, gp, division, note, detail, linked_to, login_method, last_checked_at.
// Pilihan dropdown (options) juga tebakan, sesuaikan dengan data aslimu.

const num = { type: 'number', min: 0 };

export const SECTIONS = [
  {
    id: 'info',
    title: '2. Info Utama',
    grid: 'sm:grid-cols-3',
    fields: [
      { key: 'edition_code', label: 'Kode', placeholder: 'EF-1234...' },
      { key: 'platform', label: 'Platform', type: 'select', options: ['Android', 'iOS', 'Konsol', 'PC'] },
      { key: 'tier_label', label: 'Label Tier', placeholder: 'Sultan' },
      { key: 'title', label: 'Judul', required: true, placeholder: 'Bale Biru x Udin', span: 'sm:col-span-3' },
      { key: 'subtitle', label: 'Subjudul', placeholder: 'Squad berisi formasi 4x3x3... (Isi sesuai deskripsi singkat akun)', span: 'sm:col-span-3' },
    ],
  },
  {
    id: 'angka',
    title: '3. Ringkasan Angka',
    grid: 'sm:grid-cols-4',
    fields: [
      { key: 'team_strength', label: 'Team Strength', placeholder: '3269', ...num },
      { key: 'epic', label: 'Epic', ...num },
      { key: 'big_time', label: 'Bigtime', ...num },
      { key: 'showtime', label: 'Showtime', ...num },
      { key: 'coin', label: 'Koin', ...num },
      { key: 'gp', label: 'GP', ...num },
      { key: 'division', label: 'Divisi', ...num },
    ],
  },
  {
    id: 'review',
    title: '4. Review & Detail Isi',
    grid: 'grid-cols-1',
    fields: [
      { key: 'note', label: 'Note (Review Singkat)', optional: true, type: 'textarea', rows: 4 },
      { key: 'detail', label: 'Detail Isi', type: 'textarea', rows: 10 },
    ],
  },
  {
    id: 'akun',
    title: '5. Info Akun',
    grid: 'sm:grid-cols-3',
    fields: [
      { key: 'linked_to', label: 'Tertaut ke', type: 'select', options: ['ID Konami saja', 'Google', 'Apple', 'Facebook'] },
      { key: 'login_method', label: 'Login', type: 'select', options: ['ID Konami + email', 'Google', 'Apple', 'Facebook'] },
      { key: 'last_checked_at', label: 'Terakhir dicek', type: 'date' },
      {
        key: 'status',
        label: 'Status tampil',
        type: 'select',
        noEmpty: true,
        options: [
          { value: 'published', label: 'Tayang (tampil di katalog)' },
          { value: 'draft', label: 'Draf (disembunyikan)' },
        ],
      },
    ],
  },
];

export function initialValues() {
  const values = {};
  SECTIONS.forEach((s) => s.fields.forEach((f) => (values[f.key] = '')));
  values.status = 'published';
  return values;
}

// Isi form -> body request: field kosong dilewati, angka jadi number
export function toPayload(values) {
  const out = {};
  for (const s of SECTIONS) {
    for (const f of s.fields) {
      const raw = values[f.key];
      if (raw === '' || raw == null) continue;
      out[f.key] = f.type === 'number' ? Number(raw) : String(raw).trim();
    }
  }
  return out;
}