// import { request, toQuery } from './client'
// import { getToken } from './admin' // export dulu getToken di file admin-mu

// =====================================================================
// SATU-SATUNYA FILE YANG PERLU DIGANTI SAAT API BERITA SUDAH ADA.
// Komponen hanya memakai dua fungsi di bawah ini, jadi cukup ganti
// isinya dengan request asli. Bentuk data yang dikembalikan:
//
//   { data: [{ id, title, slug, category, published_at, status }], meta }
//
// status: 'published' | 'draft' | 'archived'  (sesuaikan dengan backend)
// =====================================================================

const MOCK = [
  {
    id: 1,
    title: 'Analisis Patch v3.4: Perubahan Gaya Main Quick Counter & Long Ball Counter',
    slug: 'analisis-patch-v3-4-quick-counter',
    category: 'Update Patch',
    published_at: '2024-10-24T07:20:00Z',
    status: 'published',
  },
  {
    id: 2,
    title: 'Jadwal Event Mingguan: National Teams & Peluang Koin Gratis',
    slug: 'jadwal-event-mingguan-national-teams',
    category: 'Event',
    published_at: '2024-10-22T02:00:00Z',
    status: 'published',
  },
  {
    id: 3,
    title: 'Rekomendasi Build Pelatih & Individual Training untuk Pemain DMF Destroyer',
    slug: 'rekomendasi-build-pelatih-dmf',
    category: 'Taktik',
    published_at: '2024-10-20T11:45:00Z',
    status: 'draft',
  },
];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export async function getAdminNews({ page = 1, limit = 10 } = {}) {
  // TODO (API asli):
  // const token = await getToken()
  // return request(`/admin/news${toQuery({ page, limit })}`, { token })
  await wait(300);
  return { data: MOCK, meta: { page, limit, total: MOCK.length, total_pages: 1 } };
}

export async function deleteAdminNews(id) {
  // TODO (API asli):
  // const token = await getToken()
  // return request(`/admin/news/${id}`, { method: 'DELETE', token })
  await wait(200);
  return null;
}