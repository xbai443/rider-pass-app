<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
      @click.self="$emit('close')"
    >
      <div class="absolute inset-0 bg-black/60" />
      <div class="relative w-full max-w-sm bg-surface-card rounded-t-2xl sm:rounded-2xl px-5 pt-6 pb-8 shadow-2xl mx-4">
        <div class="text-center mb-5">
          <span class="text-4xl">📍</span>
          <h3 class="text-lg font-bold mt-2">需要开启定位</h3>
          <p class="text-xs text-white/40 mt-1">{{ reason }}</p>
        </div>

        <div v-if="isIOS" class="space-y-3 mb-5">
          <div class="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
            <span class="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
            <span class="text-base flex-shrink-0">⚙️</span>
            <span class="text-sm text-white/80">打开【设置】</span>
          </div>
          <div class="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
            <span class="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
            <span class="text-base flex-shrink-0">🔽</span>
            <span class="text-sm text-white/80">找到「骑手通行证」</span>
          </div>
          <div class="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
            <span class="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
            <span class="text-base flex-shrink-0">📍</span>
            <span class="text-sm text-white/80">点【位置】→ 选「使用App期间」</span>
          </div>
        </div>

        <div v-else class="space-y-3 mb-5">
          <div class="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
            <span class="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
            <span class="text-base flex-shrink-0">⚙️</span>
            <span class="text-sm text-white/80">打开【设置】</span>
          </div>
          <div class="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
            <span class="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
            <span class="text-base flex-shrink-0">🔽</span>
            <span class="text-sm text-white/80">点【应用】→【权限管理】</span>
          </div>
          <div class="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
            <span class="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
            <span class="text-base flex-shrink-0">📍</span>
            <span class="text-sm text-white/80">找到「骑手通行证」→ 开定位</span>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            class="flex-1 py-2.5 bg-white/10 rounded-xl text-sm font-medium active:scale-95 transition-transform"
            @click="$emit('close')"
          >
            知道了
          </button>
          <button
            class="flex-1 py-2.5 bg-accent rounded-xl text-sm font-medium active:scale-95 transition-transform"
            @click="$emit('retry')"
          >
            已开启，重试
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineProps<{
  visible: boolean
  reason?: string
}>()

defineEmits<{
  close: []
  retry: []
}>()

const isIOS = computed(() => /iPhone|iPad|iPod/.test(navigator.userAgent))
</script>
