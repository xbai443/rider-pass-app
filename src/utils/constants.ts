import type { GuardAttitude } from '@/types'

export const GUARD_LABELS: Record<GuardAttitude, string> = {
  0: '😊 友好',
  1: '😐 一般',
  2: '😠 严格',
  3: '🤬 拒绝',
}

export const GUARD_EMOJIS: Record<GuardAttitude, string> = {
  0: '😊',
  1: '😐',
  2: '😠',
  3: '🤬',
}

export const GUARD_COLORS: Record<GuardAttitude, string> = {
  0: '#4ade80',
  1: '#facc15',
  2: '#f97316',
  3: '#ef4444',
}

export const STORAGE_KEYS = {
  ENTRIES: 'rider_pass_entries',
  USER: 'rider_pass_user',
  META: 'rider_pass_meta',
} as const

export const APP_VERSION = '1.0.0'

export const DEFAULT_CENTER: [number, number] = [28.0015, 120.6551]
export const DEFAULT_ZOOM = 13