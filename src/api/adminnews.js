import { archiveContent, getAdminContents } from './admin'

//Alias untuk menjaga pemanggilan yang sudah digunakan komponen berita admin
export function getAdminNews(params) {
  return getAdminContents({ page: 1, limit: 10, ...params })
}

//Penghapusan berita dari daftar admin berarti mengarsipkan, bukan menghapus permanen
export function deleteAdminNews(id) {
  return archiveContent(id)
}
