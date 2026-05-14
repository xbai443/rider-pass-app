<template>
  <div class="w-full h-full flex flex-col">
    <div class="px-4 pt-6 pb-3">
      <h1 class="text-xl font-bold mb-1">情报列表</h1>
      <p class="text-sm text-white/40 mb-4">{{ entries.length }} 条情报{{ filtered.length !== entries.length ? ` · 显示 ${filtered.length} 条` : '' }}</p>
      <SearchBar v-model:query="query" v-model:attitude="attitudeFilter" v-model:city="cityFilter" />

      <div class="flex gap-2 mt-3">
        <button
          v-for="item in sortOptions"
          :key="item.key"
          class="px-3 py-1 rounded-full text-xs font-medium transition-colors"
          :class="sortBy === item.key ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'"
          @click="sortBy = item.key"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-4 pb-20">
      <div v-if="filtered.length === 0" class="flex flex-col items-center justify-center py-16 text-white/20">
        <Search :size="48" class="mb-3" />
        <p class="text-sm">暂无匹配情报</p>
        <p class="text-xs mt-1">去打卡页贡献第一条吧</p>
      </div>

      <TransitionGroup name="list" tag="div" class="space-y-2">
        <EntryCard
          v-for="entry in filtered"
          :key="entry.id"
          :entry="entry"
          @click="goToMap(entry)"
        />
      </TransitionGroup>
    </div>
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

const store = useEntriesStore()
const router = useRouter()

const entries = store.entries
const query = ref('')
const attitudeFilter = ref<GuardAttitude | null>(null)
const cityFilter = ref<string | null>(null)
const sortBy = ref<'newest' | 'useful'>('newest')

const sortOptions = [
  { key: 'newest' as const, label: '最新' },
  { key: 'useful' as const, label: '最有用' },
]

const filtered = computed(() => {
  let result = store.filteredEntries(query.value, attitudeFilter.value)
  if (cityFilter.value) {
    result = result.filter(e => e.address.includes(cityFilter.value!))
  }
  if (sortBy.value === 'newest') {
    result = [...result].sort((a, b) => b.createdAt - a.createdAt)
  } else {
    result = [...result].sort((a, b) => (b.votes.up - b.votes.down) - (a.votes.up - a.votes.down))
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