<template>
  <div class="bg-surface-card border border-white/5 rounded-2xl p-4">
    <div class="flex items-center gap-2 mb-3">
      <Trophy :size="16" class="text-accent-yellow" />
      <h3 class="text-sm font-bold">贡献排行榜</h3>
    </div>

    <div v-if="rankList.length === 0" class="text-center py-6 text-white/20 text-sm">
      {{ loading ? '加载中...' : '暂无贡献数据' }}
    </div>

    <div v-else class="space-y-1">
      <div
        v-for="(item, idx) in rankList.slice(0, 10)"
        :key="item.name"
        class="flex items-center gap-3 h-10 px-2 rounded-lg"
        :class="idx < 3 ? 'bg-white/[0.03]' : ''"
      >
        <span class="w-6 text-center text-sm flex-shrink-0" :class="rankText(idx)">
          {{ rankIcon(idx) }}
        </span>
        <span class="flex-1 text-sm truncate" :class="idx < 3 ? 'font-medium' : 'text-white/60'">
          {{ item.name || '匿名骑手' }}
        </span>
        <span class="text-xs text-white/30 flex-shrink-0">{{ item.count }} 条</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Trophy } from 'lucide-vue-next'
import { fetchRankings } from '@/api'

const rankList = ref<{ name: string; count: number }[]>([])
const loading = ref(false)

async function loadRankings() {
  loading.value = true
  try {
    const data = await fetchRankings()
    rankList.value = data.map((u) => ({ name: u.nickname, count: u.contributionCount }))
  } catch {
    rankList.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadRankings)

function rankIcon(idx: number): string {
  if (idx === 0) return '🥇'
  if (idx === 1) return '🥈'
  if (idx === 2) return '🥉'
  return `${idx + 1}`
}

function rankText(idx: number): string {
  if (idx < 3) return 'text-base'
  return 'text-white/25'
}
</script>