import { request, toQuery } from './client'

//Jadwal publik yang tayang dan masih berlaku. Kartu besar selalu di urutan pertama
export function getSchedules({ limit = 3 } = {}) {
  return request(`/schedules${toQuery({ limit })}`, {
    next: { revalidate: 30 },
  })
}
