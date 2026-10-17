import React from 'react';

/**
 * Format tanggal ke format lokal Indonesia (contoh: 14 Okt 2026).
 * Jika nilai tanggal berupa teks yang sudah terformat, kembalikan teks tersebut.
 * Jika nilai tidak valid atau null/kosong, kembalikan tanda '—'.
 */
function formatDate(dateValue) {
  if (!dateValue) return '—';

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return String(dateValue);
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate);
}

export default function DetailEdition({
  detail = null,
  linkedTo = null,
  loginMethod = null,
  lastCheckedAt = null,
}) {
  // Cek apakah detail merupakan objek terstruktur atau teks biasa
  const parseDetailContent = () => {
    if (!detail) return null;
    if (typeof detail === 'object') return detail;
    if (typeof detail === 'string') {
      const trimmed = detail.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          return JSON.parse(trimmed);
        } catch {
          return trimmed;
        }
      }
      return trimmed;
    }
    return String(detail);
  };

  const parsedDetail = parseDetailContent();
  const hasAccountInfo = Boolean(linkedTo || loginMethod || lastCheckedAt);

  return (
    <section className="mt-10 sm:mt-12 pt-8 sm:pt-10 border-t border-slate-200">
      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-6">
        Detail Edisi
      </h2>

      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-card space-y-6">
        {/* 1. Bagian Konten Detail Edisi */}
        <div>
          {parsedDetail ? (
            typeof parsedDetail === 'string' ? (
              <div className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                {parsedDetail}
              </div>
            ) : Array.isArray(parsedDetail) ? (
              <ul className="list-disc list-inside space-y-1.5 text-sm sm:text-base text-slate-700">
                {parsedDetail.map((item, idx) => (
                  <li key={idx}>
                    {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="space-y-3 text-sm sm:text-base text-slate-700">
                {Object.entries(parsedDetail).map(([key, value]) => (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                    <span className="font-semibold text-slate-900 capitalize shrink-0 sm:w-44">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="hidden sm:inline text-slate-400">:</span>
                    <span className="text-slate-700">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            )
          ) : (
            <p className="text-sm text-slate-400 italic">
              Rincian spesifik edisi dan pemain belum dicantumkan untuk akun ini.
            </p>
          )}
        </div>

        {/* Garis Pemisah Antar Bagian */}
        <hr className="border-slate-100" />

        {/* 2. Bagian INFO AKUN */}
        <div>
          <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-900 mb-3">
            Info Akun
          </h3>

          {hasAccountInfo ? (
            <div className="space-y-2.5 text-sm">
              <div className="flex items-baseline">
                <span className="w-36 text-slate-500 font-medium shrink-0">Tertaut ke</span>
                <span className="text-slate-400 mr-3">:</span>
                <span className="font-semibold text-slate-900">{linkedTo || '—'}</span>
              </div>
              <div className="flex items-baseline">
                <span className="w-36 text-slate-500 font-medium shrink-0">Metode Login</span>
                <span className="text-slate-400 mr-3">:</span>
                <span className="font-semibold text-slate-900">{loginMethod || '—'}</span>
              </div>
              <div className="flex items-baseline">
                <span className="w-36 text-slate-500 font-medium shrink-0">Terakhir Dicek</span>
                <span className="text-slate-400 mr-3">:</span>
                <span className="font-semibold text-slate-900">{formatDate(lastCheckedAt)}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">
              Informasi tautan akun dan verifikasi login belum tersedia.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
