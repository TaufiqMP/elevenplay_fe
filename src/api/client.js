const API_URL = process.env.NEXT_PUBLIC_API_URL

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }
}

//Mengubah objek jadi query string, dan melewati nilai yang kosong
export function toQuery(params = {}) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value)
    }
  }
  const text = query.toString()
  return text ? `?${text}` : ''
}

//ini fungsinya untuk melakukan request ke API, dengan method, body, token, dan opsi tambahan. Jika ada body, maka akan diubah menjadi JSON. 
// Jika ada token, maka akan ditambahkan ke header Authorization. Setelah itu, akan dilakukan fetch ke API_URL dengan path yang diberikan. 
// Jika status response adalah 204, maka akan mengembalikan null. 
// Jika response tidak ok, maka akan melempar ApiError dengan status, code, dan message dari response. 
// Jika response ok, maka akan mengembalikan data dari response.
export async function request(path, { method = 'GET', body, token, ...options } = {}) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  })

  if (res.status === 204) return null

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.error?.code || 'UNKNOWN',
      data?.error?.message || 'Terjadi kesalahan'
    )
  }
  return data
}