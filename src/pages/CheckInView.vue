<template>
  <div class="w-full h-full overflow-y-auto pb-16">
    <div class="max-w-lg mx-auto px-4 pt-6">
      <h1 class="text-xl font-bold mb-1">录入情报</h1>
      <p class="text-sm text-white/40 mb-6">帮兄弟少走弯路，多跑几单</p>

      <CheckInForm :initial-lat="initialLat" :initial-lng="initialLng" @submitted="onSubmitted" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CheckInForm from '@/components/CheckInForm.vue'

const route = useRoute()
const router = useRouter()

const initialLat = computed(() => {
  const v = Number(route.query.lat)
  return isNaN(v) ? 0 : v
})

const initialLng = computed(() => {
  const v = Number(route.query.lng)
  return isNaN(v) ? 0 : v
})

function onSubmitted() {
  router.push('/')
}
</script>