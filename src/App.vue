<template>
  <div class="h-screen w-full bg-[#0a0a0a] text-white relative flex flex-col">
    <router-view class="flex-1 min-h-0" />
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import BottomNav from '@/components/BottomNav.vue'
import { useEntriesStore } from '@/stores/entries'
import { useUserStore } from '@/stores/user'

const entriesStore = useEntriesStore()
const userStore = useUserStore()

onMounted(async () => {
  entriesStore.loadEntries()
  if (userStore.isLoggedIn()) {
    userStore.refreshProfile()
  }
})
</script>