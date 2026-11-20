const dateFormat = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Asia/Jakarta',
});

//Tanggal untuk forum, mis. "20 Nov 2026, 21:38"
export function formatForumDate(iso) {
  if (!iso) return '';
  return dateFormat.format(new Date(iso));
}

//Ringkasan untuk kartu: tanda Markdown dibuang, dipotong kalau terlalu panjang
export function excerptOf(body, maxLength = 160) {
  const plain = String(body ?? '')
    .replace(/[#*_>`~\[\]()!-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trimEnd()}...`;
}
