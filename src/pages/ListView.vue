<template>
  <div class="w-full h-full flex flex-col">
    <div class="px-4 pt-6 pb-3">
      <h1 class="text-xl font-bold mb-1">情报列表</h1>
      <p class="text-sm text-white/40 mb-4">
        <span v-if="store.loading">正在加载...</span>
        <span v-else>{{ entries.length }} 条情报{{ filtered.length !== entries.length ? ` · 显示 ${filtered.length} 条` : '' }}</span>
      </p>
      <SearchBar v-model:query="query" v-model:attitude="attitudeFilter" v-model:city="cityFilter" />

      <div class="flex gap-2 mt-3 overflow-x-auto">
        <button
          v-for="item in sortOptions"
          :key="item.key"
          class="px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap"
          :class="sortBy === item.key ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'"
          @click="onSortChange(item.key)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-4 pb-20">
      <div v-if="store.loading" class="flex flex-col items-center justify-center py-16 text-white/20">
        <span class="inline-block w-8 h-8 border-2 border-white/20 border-t-accent rounded-full animate-spin mb-3" />
        <p class="text-sm">加载中...</p>
      </div>

      <div v-else-if="filtered.length === 0" class="flex flex-col items-center justify-center py-16 text-white/20">
        <Search :size="48" class="mb-3" />
        <p class="text-sm">暂无匹配情报</p>
        <p class="text-xs mt-1">去打卡页贡献第一条吧</p>
      </div>

      <TransitionGroup v-else name="list" tag="div" class="space-y-2">
        <EntryCard
          v-for="entry in filtered"
          :key="entry.id"
          :entry="entry"
          @click="goToMap(entry)"
        />
      </TransitionGroup>
    </div>

    <GpsGuide
      :visible="gpsGuideVisible"
      reason="开启定位后可按距离排序，快速找附近情报"
      @close="gpsGuideVisible = false"
      @retry="gpsGuideVisible = false; locateUser()"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from 'lucide-vue-next'
import { useEntriesStore } from '@/stores/entries'
import type { GuardAttitude, Entry } from '@/types'
import SearchBar from '@/components/SearchBar.vue'
import EntryCard from '@/components/EntryCard.vue'
import GpsGuide from '@/components/GpsGuide.vue'

const store = useEntriesStore()
const router = useRouter()

const entries = computed(() => store.entries)
const query = ref('')
const attitudeFilter = ref<GuardAttitude | null>(null)
const cityFilter = ref<string | null>(null)
const sortBy = ref<'newest' | 'useful' | 'nearest'>('newest')
const userLat = ref<number | null>(null)
const userLng = ref<number | null>(null)
const locating = ref(false)
const gpsGuideVisible = ref(false)

const sortOptions = [
  { key: 'newest' as const, label: '最新' },
  { key: 'useful' as const, label: '最有用' },
  { key: 'nearest' as const, label: '离我最近' },
]

function toRad(d: number) { return d * Math.PI / 180 }

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

async function locateUser() {
  if (userLat.value !== null) return
  if (!navigator.geolocation) {
    gpsGuideVisible.value = true
    return
  }
  locating.value = true
  return new Promise<void>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userLat.value = pos.coords.latitude
        userLng.value = pos.coords.longitude
        locating.value = false
        resolve()
      },
      (err) => {
        locating.value = false
        if (err.code === err.PERMISSION_DENIED) {
          gpsGuideVisible.value = true
        }
        resolve()
      },
      { enableHighAccuracy: true, timeout: 5000 }
    )
  })
}

async function onSortChange(key: 'newest' | 'useful' | 'nearest') {
  if (key === 'nearest') await locateUser()
  sortBy.value = key
}

const filtered = computed(() => {
  let result = store.filteredEntries(query.value, attitudeFilter.value)
  if (cityFilter.value) {
    result = result.filter(e => e.address.includes(cityFilter.value!))
  }
  if (sortBy.value === 'newest') {
    result = [...result].sort((a, b) => b.createdAt - a.createdAt)
  } else if (sortBy.value === 'useful') {
    result = [...result].sort((a, b) => (b.votes.up - b.votes.down) - (a.votes.up - a.votes.down))
  } else if (sortBy.value === 'nearest' && userLat.value !== null && userLng.value !== null) {
    result = [...result].sort((a, b) => distanceKm(userLat.value!, userLng.value!, a.lat, a.lng) - distanceKm(userLat.value!, userLng.value!, b.lat, b.lng))
  }
  return result
})

function goToMap(entry: Entry) {
  router.push({ path: '/', query: { lat: String(entry.lat), lng: String(entry.lng), id: entry.id } })
}
</script>

<style scoped>
.list-enter-active {
  transition: all 0.3s ease;
}
.list-leave-active {
  transition: all 0.2s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>