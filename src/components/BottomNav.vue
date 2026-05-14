<template>
  <nav class="h-14 bg-surface-card border-t border-white/5 flex items-center justify-around flex-shrink-0">
    <button
      v-for="item in navItems"
      :key="item.to"
      @click="navigate(item.to)"
      class="flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors duration-200"
      :class="isActive(item.to) ? 'text-accent' : 'text-white/40'"
    >
      <component :is="item.icon" :size="20" :stroke-width="isActive(item.to) ? 2.5 : 1.5" />
      <span class="text-[10px] leading-none">{{ item.label }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { MapPin, PlusCircle, Search, User } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

const navItems = [
  { to: '/', label: '地图', icon: MapPin },
  { to: '/checkin', label: '打卡', icon: PlusCircle },
  { to: '/list', label: '列表', icon: Search },
  { to: '/me', label: '我的', icon: User },
]

function isActive(path: string) {
  return route.path === path
}

function navigate(path: string) {
  router.push(path)
}
</script>