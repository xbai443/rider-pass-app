<template>
  <div class="space-y-3">
    <div class="relative">
      <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
      <input
        :value="query"
        @input="$emit('update:query', ($event.target as HTMLInputElement).value)"
        type="text"
        placeholder="搜索小区名称..."
        class="w-full h-11 bg-surface-card border border-white/5 rounded-xl pl-10 pr-4 text-white text-sm placeholder:text-white/15 outline-none focus:border-accent/50 transition-colors"
      />
    </div>

    <div class="flex gap-2 overflow-x-auto no-scrollbar">
      <button
        v-for="opt in filterOptions"
        :key="String(opt.value)"
        @click="$emit('update:attitude', opt.value)"
        class="flex-shrink-0 h-8 px-3 rounded-lg text-xs font-medium transition-all active:scale-95"
        :class="attitude === opt.value ? 'bg-accent text-white' : 'bg-surface-card text-white/40 border border-white/5'"
      >
        {{ opt.label }}
      </button>
    </div>

    <div v-if="cities.length > 1" class="flex gap-2 overflow-x-auto no-scrollbar">
      <button
        v-for="city in cities"
        :key="city"
        @click="$emit('update:city', city === cityFilter ? null : city)"
        class="flex-shrink-0 h-8 px-3 rounded-lg text-xs font-medium transition-all active:scale-95"
        :class="cityFilter === city ? 'bg-accent text-white' : 'bg-surface-card text-white/40 border border-white/5'"
      >
        {{ city }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Search } from 'lucide-vue-next'
import { useEntriesStore } from '@/stores/entries'
import type { GuardAttitude } from '@/types'

const props = defineProps<{
  query: string
  attitude: GuardAttitude | null
  cityFilter?: string | null
}>()

defineEmits<{
  'update:query': [value: string]
  'update:attitude': [value: GuardAttitude | null]
  'update:city': [value: string | null]
}>()

const filterOptions: { label: string; value: GuardAttitude | null }[] = [
  { label: '全部', value: null },
  { label: '😊 友好', value: 0 },
  { label: '😐 一般', value: 1 },
  { label: '😠 严格', value: 2 },
  { label: '🤬 拒绝', value: 3 },
]

const store = useEntriesStore()
const cities = computed(() => {
  const set = new Set<string>()
  for (const e of store.entries) {
    const m = e.address.match(/([\u4e00-\u9fa5]+市)/)
    if (m) set.add(m[1])
  }
  return Array.from(set).sort()
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>