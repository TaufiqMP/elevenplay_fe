//Fungsi bantu untuk menampilkan jadwal. Dipakai di beranda dan halaman admin

export const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const TYPE_LABELS = {
  live_tiktok: 'Live TikTok',
  room_match: 'Room Match',
};

const dateFormat = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Jakarta',
});

//"20:00:00" menjadi "20:00"
function shortTime(value) {
  return value ? String(value).slice(0, 5) : '';
}

//Contoh hasil: "Setiap Sabtu: 20:00 - 23:00 WIB" atau "Rabu, 31 Des 2026: 19:00 WIB"
export function formatWhen(schedule) {
  const start = shortTime(schedule.start_time) || '--:--';
  const end = shortTime(schedule.end_time);
  const time = end ? `${start} - ${end} WIB` : `${start} WIB`;

  if (schedule.recurrence === 'weekly') {
    const day = DAYS[Number(schedule.day_of_week)] ?? '';
    return `Setiap ${day}: ${time}`;
  }

  if (!schedule.event_date) return time;
  const date = dateFormat.format(new Date(`${schedule.event_date}T00:00:00+07:00`));
  return `${date}: ${time}`;
}

//Tempat jadwal. Live TikTok tanpa tempat memakai akun TikTok dari Pengaturan
export function formatPlace(schedule, settings) {
  if (schedule.location) return schedule.location;
  if (schedule.type === 'live_tiktok' && settings?.tiktok_username) {
    return `TikTok @${settings.tiktok_username}`;
  }
  return '';
}

//Link kartu jadwal. Live TikTok tanpa link memakai link live akun dari Pengaturan
export function scheduleLink(schedule, settings) {
  if (schedule.link_url) return schedule.link_url;
  if (schedule.type === 'live_tiktok') return settings?.tiktok_live_url ?? null;
  return null;
}
