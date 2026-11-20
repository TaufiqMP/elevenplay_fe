import { request } from './client'

//Pengaturan publik: akun TikTok dan nomor WhatsApp admin, beserta link-nya
//Hasil: { tiktok_username, tiktok_url, tiktok_live_url, whatsapp_number, whatsapp_url }
export function getSettings() {
  return request('/settings', {
    next: { revalidate: 60 },
  })
}
