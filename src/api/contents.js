import { request, toQuery } from './client'

//Daftar berita publik yang sudah terbit
export function getContents({ page = 1, limit = 12, q } = {}) {
  return request(`/contents${toQuery({ page, limit, q })}`, {
    next: { revalidate: 30 },
  })
}

//Detail berita publik berdasarkan slug
export function getContentBySlug(slug) {
  return request(`/contents/${encodeURIComponent(slug)}`, {
    next: { revalidate: 30 },
  })
}

//Daftar kategori untuk dropdown
export function getContentCategories() {
  return request('/content-categories', {
    next: { revalidate: 30 },
  })
}
