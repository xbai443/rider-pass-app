import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Entry, GuardAttitude } from '@/types'
import { nanoid } from 'nanoid'
import * as api from '@/api'

export const useEntriesStore = defineStore('entries', () => {
  const entries = ref<Entry[]>([])
  const loading = ref(false)

  async function loadEntries(params?: {
    query?: string
    attitude?: GuardAttitude | null
    city?: string | null
    sort?: 'newest' | 'useful'
  }) {
    loading.value = true
    try {
      entries.value = await api.fetchEntries(params)
    } catch (e) {
      console.error('加载条目失败:', e)
    } finally {
      loading.value = false
    }
  }

  async function addEntry(data: Omit<Entry, 'id' | 'createdAt' | 'votes'>, userId: string) {
    const entry = await api.createEntry({
      ...data,
      contributorId: userId,
    })
    entries.value.unshift(entry)
    return entry
  }

  async function voteUp(entryId: string, userId: string) {
    const updated = await api.voteEntry(entryId, userId, 1)
    const idx = entries.value.findIndex(e => e.id === entryId)
    if (idx !== -1) entries.value[idx] = updated
    return updated
  }

  async function voteDown(entryId: string, userId: string) {
    const updated = await api.voteEntry(entryId, userId, -1)
    const idx = entries.value.findIndex(e => e.id === entryId)
    if (idx !== -1) entries.value[idx] = updated
    return updated
  }

  async function removeEntry(entryId: string, userId?: string) {
    await api.deleteEntry(entryId, userId)
    entries.value = entries.value.filter(e => e.id !== entryId)
  }

  function filteredEntries(query: string, attitude: GuardAttitude | null) {
    return entries.value.filter(e => {
      const keyword = query.toLowerCase()
      const matchName = !keyword || e.name.toLowerCase().includes(keyword)
      const matchEntrance = !keyword || (e.entrance || '').toLowerCase().includes(keyword)
      const matchTips = !keyword || (e.tips || '').toLowerCase().includes(keyword)
      const matchText = matchName || matchEntrance || matchTips
      const matchAttitude = attitude === null || e.guardAttitude === attitude
      return matchText && matchAttitude
    })
  }

  const contributionMap = computed(() => {
    const map: Record<string, number> = {}
    for (const e of entries.value) {
      const name = e.contributor || '匿名骑手'
      map[name] = (map[name] || 0) + 1
    }
    return map
  })

  return {
    entries,
    loading,
    loadEntries,
    addEntry,
    voteUp,
    voteDown,
    removeEntry,
    filteredEntries,
    contributionMap,
  }
})