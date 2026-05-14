<template>
  <div class="fixed inset-x-0 bottom-16 z-[2000] mx-3" @click.self="$emit('close')">
    <div class="bg-surface-card/95 backdrop-blur-xl border border-white/5 rounded-2xl p-4 shadow-2xl shadow-black/50 max-h-[320px] overflow-y-auto">
      <div class="flex items-start gap-3 mb-3">
        <span class="text-2xl flex-shrink-0">{{ emoji }}</span>
        <div class="flex-1 min-w-0">
          <h2 class="text-base font-bold truncate">{{ entry.name }}</h2>
          <p class="text-xs text-white/40 mt-0.5">{{ entry.address }}</p>
        </div>
        <button @click="$emit('close')" class="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors">
          <X :size="16" class="text-white/40" />
        </button>
      </div>

      <div class="grid grid-cols-2 gap-2 mb-3">
        <div class="bg-white/5 rounded-lg px-3 py-2">
          <p class="text-[10px] text-white/30">保安态度</p>
          <p class="text-sm mt-0.5" :style="{ color }">{{ label }}</p>
        </div>
        <div class="bg-white/5 rounded-lg px-3 py-2">
          <p class="text-[10px] text-white/30">电梯上楼</p>
          <p class="text-sm mt-0.5" :class="entry.elevatorAccess ? 'text-accent-green' : 'text-accent-red'">
            {{ entry.elevatorAccess ? '可以' : '不行' }}
          </p>
        </div>
      </div>

      <div v-if="entry.entrance" class="bg-white/5 rounded-lg px-3 py-2 mb-2">
        <p class="text-[10px] text-white/30">入口描述</p>
        <p class="text-sm mt-0.5 text-white/80">{{ entry.entrance }}</p>
      </div>

      <div v-if="entry.tips" class="bg-white/5 rounded-lg px-3 py-2 mb-3">
        <p class="text-[10px] text-white/30">备注</p>
        <p class="text-sm mt-0.5 text-white/80">{{ entry.tips }}</p>
      </div>

      <div class="flex items-center justify-between text-xs text-white/30 mb-3">
        <span>{{ entry.contributor || '匿名骑手' }} · 贡献</span>
        <span>{{ formatTime(entry.createdAt) }}</span>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="navigateTo"
          class="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-lg bg-accent/10 text-accent text-sm font-medium active:scale-[0.97] transition-transform"
        >
          <Navigation :size="14" />
          导航到这里
        </button>
        <button
          @click="$emit('vote-up', entry.id)"
          class="h-9 px-3 flex items-center justify-center gap-1 rounded-lg bg-accent-green/10 text-accent-green text-sm font-medium active:scale-[0.97] transition-transform"
        >
          <ThumbsUp :size="14" />
          {{ entry.votes.up }}
        </button>
        <button
          @click="$emit('vote-down', entry.id)"
          class="h-9 px-3 flex items-center justify-center gap-1 rounded-lg bg-accent-red/10 text-accent-red text-sm font-medium active:scale-[0.97] transition-transform"
        >
          <ThumbsDown :size="14" />
          {{ entry.votes.down }}
        </button>
        <button
          @click="confirmDelete"
          class="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 text-white/30 hover:text-accent-red active:scale-[0.97] transition-colors"
        >
          <Trash2 :size="14" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { X, ThumbsUp, ThumbsDown, Trash2, Navigation } from 'lucide-vue-next'
import { GUARD_LABELS, GUARD_EMOJIS, GUARD_COLORS } from '@/utils/constants'
import { wgs84ToGcj02 } from '@/utils/coord'
import type { Entry } from '@/types'

const props = defineProps<{ entry: Entry }>()
const emit = defineEmits<{
  close: []
  'vote-up': [id: string]
  'vote-down': [id: string]
  delete: [id: string]
}>()

const emoji = computed(() => GUARD_EMOJIS[props.entry.guardAttitude])
const label = computed(() => GUARD_LABELS[props.entry.guardAttitude])
const color = computed(() => GUARD_COLORS[props.entry.guardAttitude])

function formatTime(ts: number) {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function confirmDelete() {
  if (confirm('确定删除这条情报吗？')) {
    emit('delete', props.entry.id)
  }
}

function navigateTo() {
  const [gcjLat, gcjLng] = wgs84ToGcj02(props.entry.lat, props.entry.lng)
  const name = encodeURIComponent(props.entry.name)
  const url = `https://uri.amap.com/navigation?to=${gcjLng},${gcjLat},${name}&mode=riding&callnative=1`
  window.open(url, '_blank')
}
</script>