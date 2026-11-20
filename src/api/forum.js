import { supabase } from '../supabase'
import { request, toQuery, ApiError } from './client'

//Token dari sesi login, untuk fungsi yang perlu login (member)
async function getToken() {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new ApiError(401, 'UNAUTHORIZED', 'Silakan login terlebih dahulu')
  return token
}

//---------- PUBLIK ----------

//Kategori untuk filter
export function getForumCategories() {
  return request('/forum/categories')
}

//Daftar thread tayang. Bisa difilter kategori (category = id) dan dicari (q)
export function getForumThreads({ page = 1, limit = 12, category, q } = {}) {
  return request(`/forum/threads${toQuery({ page, limit, category, q })}`)
}

//Detail thread tayang berdasarkan slug
export function getForumThread(slug) {
  return request(`/forum/threads/${encodeURIComponent(slug)}`)
}

//Komentar thread (sudah termasuk balasan, urut waktu)
export async function getForumComments(slug) {
  const res = await request(`/forum/threads/${encodeURIComponent(slug)}/comments`)
  return res.data ?? []
}

//---------- MEMBER (HARUS LOGIN) ----------

//Thread milik sendiri. status kosong = semua
export async function getMyThreads(status) {
  const token = await getToken()
  const res = await request(`/forum/me/threads${toQuery({ status })}`, { token })
  return res.data ?? []
}

//Detail thread milik sendiri, untuk form ubah
export async function getMyThread(id) {
  const token = await getToken()
  return request(`/forum/me/threads/${encodeURIComponent(id)}`, { token })
}

//Buat thread. status: 'draft' atau 'published'
export async function createForumThread(body) {
  const token = await getToken()
  return request('/forum/threads', { method: 'POST', body, token })
}

//Ubah thread milik sendiri
export async function updateForumThread(id, body) {
  const token = await getToken()
  return request(`/forum/threads/${encodeURIComponent(id)}`, { method: 'PATCH', body, token })
}

//Arsipkan thread milik sendiri
export async function archiveForumThread(id) {
  const token = await getToken()
  return request(`/forum/threads/${encodeURIComponent(id)}`, { method: 'DELETE', token })
}

//Tulis komentar. parentId diisi kalau membalas komentar utama
export async function createForumComment(threadId, body, parentId = null) {
  const token = await getToken()
  return request(`/forum/threads/${encodeURIComponent(threadId)}/comments`, {
    method: 'POST',
    body: { body, parent_id: parentId },
    token,
  })
}

//Hapus komentar milik sendiri
export async function deleteForumComment(id) {
  const token = await getToken()
  return request(`/forum/comments/${encodeURIComponent(id)}`, { method: 'DELETE', token })
}

//Apakah saya sudah menyukai thread ini
export async function getLikeStatus(threadId) {
  const token = await getToken()
  return request(`/forum/threads/${encodeURIComponent(threadId)}/like`, { token })
}

//Suka atau batal suka
export async function setLike(threadId, liked) {
  const token = await getToken()
  return request(`/forum/threads/${encodeURIComponent(threadId)}/like`, {
    method: liked ? 'PUT' : 'DELETE',
    token,
  })
}
