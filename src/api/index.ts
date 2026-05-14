import type { Entry } from '@/types'

const BASE = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '网络错误' }))
    throw new Error(err.error || `请求失败 (${res.status})`)
  }
  return res.json()
}

export function fetchEntries(params?: {
  query?: string
  attitude?: number | null
  city?: string | null
  sort?: 'newest' | 'useful'
}): Promise<Entry[]> {
  const search = new URLSearchParams()
  if (params?.query) search.set('query', params.query)
  if (params?.attitude != null) search.set('attitude', String(params.attitude))
  if (params?.city) search.set('city', params.city)
  if (params?.sort) search.set('sort', params.sort)
  const qs = search.toString()
  return request<Entry[]>(`/entries${qs ? `?${qs}` : ''}`)
}

export function createEntry(data: {
  name: string
  address: string
  lat: number
  lng: number
  entrance: string
  guardAttitude: number
  elevatorAccess: boolean
  tips: string
  contributorId: string
}): Promise<Entry> {
  return request<Entry>('/entries', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function voteEntry(entryId: string, userId: string, direction: 1 | -1): Promise<Entry> {
  return request<Entry>(`/entries/${entryId}/vote`, {
    method: 'POST',
    body: JSON.stringify({ userId, direction }),
  })
}

export function deleteEntry(entryId: string, userId?: string): Promise<void> {
  return request<void>(`/entries/${entryId}`, {
    method: 'DELETE',
    body: JSON.stringify({ userId }),
  })
}

export function loginUser(nickname: string): Promise<{ id: string; nickname: string; createdAt: number }> {
  return request('/users/login', {
    method: 'POST',
    body: JSON.stringify({ nickname }),
  })
}

export function fetchUserProfile(userId: string): Promise<{ id: string; nickname: string; contributionCount: number; createdAt: number }> {
  return request(`/users/${userId}/profile`)
}

export function fetchRankings(): Promise<{ id: string; nickname: string; contributionCount: number }[]> {
  return request('/users/rankings')
}