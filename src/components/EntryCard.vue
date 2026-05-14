<template>
  <button
    class="w-full flex items-center gap-3 bg-surface-card border border-white/5 rounded-xl px-4 py-3 text-left active:scale-[0.98] transition-transform"
    @click="$emit('click')"
  >
    <div
      class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
      :style="{ backgroundColor: color + '20' }"
    >
      {{ emoji }}
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium truncate">{{ entry.name }}</p>
      <p class="text-xs mt-0.5 truncate" :style="{ color }">{{ label }}</p>
    </div>
    <ChevronRight :size="16" class="text-white/10 flex-shrink-0" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import { GUARD_EMOJIS, GUARD_COLORS, GUARD_LABELS } from '@/utils/constants'
import type { Entry } from '@/types'

const props = defineProps<{ entry: Entry }>()
defineEmits<{ click: [] }>()

const emoji = computed(() => GUARD_EMOJIS[props.entry.guardAttitude])
const color = computed(() => GUARD_COLORS[props.entry.guardAttitude])
const label = computed(() => GUARD_LABELS[props.entry.guardAttitude])
</script>