import { request, toQuery } from './client'

//kode yang disini itu untuk publik bukan buat admin

//Daftar kartu E-Katalog. Hasil: { data: [...], meta: { page, limit, total, total_pages } }
export function getAccounts({ page = 1, limit = 12 } = {}) {
  return request(`/accounts${toQuery({ page, limit })}`, {
    next: { revalidate: 30 },
  })
}

//Detail satu akun berdasarkan kode, mis. 'EK-0001'. Melempar ApiError 404 kalau tidak ada
export function getAccountByCode(code) {
  return request(`/accounts/${encodeURIComponent(code)}`, {
    next: { revalidate: 30 },
  })
}