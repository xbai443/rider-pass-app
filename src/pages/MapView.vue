<template>
  <div class="relative w-full h-full">
    <div ref="mapContainer" class="w-full h-full" style="min-height: 100%;" />

    <div class="absolute top-0 left-0 right-0 px-4 pt-4 pb-8 bg-gradient-to-b from-black/80 to-transparent z-[400] pointer-events-none">
      <h1 class="text-lg font-bold tracking-wide">骑手通行证</h1>
      <p class="text-xs text-white/50 mt-0.5">
        <span v-if="store.loading">加载中...</span>
        <span v-else>{{ entries.length }} 条情报</span>
      </p>
    </div>

    <button
      @click="locateMe"
      class="absolute bottom-[96px] right-4 z-[1000] w-10 h-10 bg-surface-card border border-white/5 rounded-xl flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-black/50"
      aria-label="定位"
    >
      <Crosshair :size="18" class="text-white/70" />
    </button>

    <Transition name="fade">
      <div v-if="toast" class="absolute top-[72px] left-1/2 -translate-x-1/2 z-[2000] px-4 py-2 rounded-xl bg-surface-card border border-white/10 text-xs text-white/80 shadow-lg shadow-black/50">
        {{ toast }}
      </div>
    </Transition>

    <Transition name="slide-up">
      <EntryPopup
        v-if="selectedEntry"
        :entry="selectedEntry"
        @close="selectedEntry = null"
        @vote-up="handleVoteUp"
        @vote-down="handleVoteDown"
        @delete="handleDelete"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import L from 'leaflet'
import { Crosshair } from 'lucide-vue-next'
import { useEntriesStore } from '@/stores/entries'
import { useUserStore } from '@/stores/user'
import { GUARD_COLORS, GUARD_EMOJIS, DEFAULT_CENTER, DEFAULT_ZOOM } from '@/utils/constants'
import { wgs84ToGcj02 } from '@/utils/coord'
import type { Entry, GuardAttitude } from '@/types'
import EntryPopup from '@/components/EntryPopup.vue'

const store = useEntriesStore()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const entries = store.entries

const mapContainer = ref<HTMLDivElement>()
const selectedEntry = ref<Entry | null>(null)
const toast = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(msg: string, duration = 2500) {
  toast.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, duration)
}
let map: L.Map | null = null
let markersLayer: L.LayerGroup | null = null
let userLocationMarker: L.CircleMarker | null = null
let userLocationPulse: L.CircleMarker | null = null

function getZoomThreshold(zoom: number): number {
  if (zoom <= 12) return 0.02
  if (zoom <= 13) return 0.008
  if (zoom <= 14) return 0.003
  if (zoom <= 15) return 0.001
  return 0.0003
}

function createIcon(attitude: GuardAttitude, entryId: string, size = 44) {
  const color = GUARD_COLORS[attitude]
  const emoji = GUARD_EMOJIS[attitude]
  const fontSize = Math.round(size * 0.5)
  const border = Math.max(2, Math.round(size * 0.056))
  const shadow = Math.round(size * 0.32)
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: ${size}px; height: ${size}px;
      background: ${color}22;
      border: ${border}px solid ${color};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${fontSize}px;
      box-shadow: 0 0 ${shadow}px ${color}44;
      cursor: pointer;
      transition: transform 0.2s ease;
    " data-entry-id="${entryId}">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [Math.round(size / 2), Math.round(size / 2)],
  })
}

function createClusterIcon(count: number) {
  const size = count > 20 ? 50 : count > 8 ? 44 : 38
  const fontSize = count > 20 ? 14 : count > 8 ? 13 : 12
  return L.divIcon({
    className: 'cluster-marker',
    html: `<div style="
      width: ${size}px; height: ${size}px;
      background: #3b82f6;
      border: 2.5px solid #ffffff33;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${fontSize}px;
      font-weight: 700;
      color: #fff;
      box-shadow: 0 0 18px #3b82f644;
      cursor: pointer;
    ">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [Math.round(size / 2), Math.round(size / 2)],
  })
}

function renderMarkers() {
  if (!map) return
  if (markersLayer) {
    markersLayer.clearLayers()
  } else {
    markersLayer = L.layerGroup().addTo(map)
  }

  const zoom = map.getZoom()
  const threshold = getZoomThreshold(zoom)
  const clusters: Map<string, Entry[]> = new Map()

  for (const entry of entries) {
    const [gcjLat, gcjLng] = wgs84ToGcj02(entry.lat, entry.lng)
    const gridLat = Math.round(gcjLat / threshold)
    const gridLng = Math.round(gcjLng / threshold)
    const key = `${gridLat},${gridLng}`
    if (!clusters.has(key)) clusters.set(key, [])
    clusters.get(key)!.push(entry)
  }

  for (const [, group] of clusters) {
    if (group.length === 1) {
      const entry = group[0]
      const [gcjLat, gcjLng] = wgs84ToGcj02(entry.lat, entry.lng)
      const marker = L.marker([gcjLat, gcjLng], {
        icon: createIcon(entry.guardAttitude, entry.id),
      })
      marker.on('click', () => { selectedEntry.value = entry })
      markersLayer.addLayer(marker)
    } else {
      let sumLat = 0, sumLng = 0
      for (const e of group) {
        const [la, ln] = wgs84ToGcj02(e.lat, e.lng)
        sumLat += la
        sumLng += ln
      }
      const cx = sumLat / group.length
      const cy = sumLng / group.length
      const marker = L.marker([cx, cy], {
        icon: createClusterIcon(group.length),
      })
      marker.on('click', () => {
        if (map && zoom < 16) {
          map.setView([cx, cy], Math.min(zoom + 2, 17), { animate: true })
        }
      })
      markersLayer.addLayer(marker)
    }
  }
}

function updateUserLocation(lat: number, lng: number, zoomTo = true) {
  if (!map) return
  const [gcjLat, gcjLng] = wgs84ToGcj02(lat, lng)

  if (zoomTo) {
    map.setView([gcjLat, gcjLng], 16, { animate: true })
  }

  if (userLocationMarker) {
    userLocationMarker.setLatLng([gcjLat, gcjLng])
  } else {
    userLocationMarker = L.circleMarker([gcjLat, gcjLng], {
      radius: 8,
      fillColor: '#3B82F6',
      fillOpacity: 1,
      color: '#FFFFFF',
      weight: 3,
      opacity: 1,
    }).addTo(map)
  }

  if (userLocationPulse) {
    userLocationPulse.setLatLng([gcjLat, gcjLng])
  } else {
    userLocationPulse = L.circleMarker([gcjLat, gcjLng], {
      radius: 24,
      fillColor: '#3B82F6',
      fillOpacity: 0.18,
      color: '#3B82F644',
      weight: 1,
      opacity: 0.5,
    }).addTo(map)
  }

  userLocationPulse.bringToBack()
  userLocationMarker.bringToFront()
}

function locateMe() {
  if (!navigator.geolocation) {
    showToast('设备不支持定位')
    return
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      if (!isFinite(lat) || !isFinite(lng)) return
      updateUserLocation(lat, lng)
    },
    () => {
      showToast('定位失败，请开启 GPS')
    },
    { enableHighAccuracy: true, timeout: 5000 }
  )
}

async function handleVoteUp(id: string) {
  if (!userStore.isLoggedIn()) {
    showToast('请先在"我的"页面设置昵称')
    return
  }
  const updated = await store.voteUp(id, userStore.userId)
  if (updated) selectedEntry.value = updated
}

async function handleVoteDown(id: string) {
  if (!userStore.isLoggedIn()) {
    showToast('请先在"我的"页面设置昵称')
    return
  }
  const updated = await store.voteDown(id, userStore.userId)
  if (updated) selectedEntry.value = updated
}

async function handleDelete(id: string) {
  await store.removeEntry(id, userStore.userId)
  selectedEntry.value = null
}

function navigateToEntry() {
  const { lat, lng, id } = route.query
  if (lat && lng && map) {
    const [gcjLat, gcjLng] = wgs84ToGcj02(Number(lat), Number(lng))
    map.setView([gcjLat, gcjLng], 17, { animate: true })
    if (id) {
      const entry = entries.find(e => e.id === String(id))
      if (entry) {
        selectedEntry.value = entry
      }
    }
    router.replace({ query: {} })
  }
}

onMounted(async () => {
  if (!mapContainer.value) return

  await nextTick()

  if (entries.length === 0 && store.loading) {
    await new Promise<void>((resolve) => {
      const stop = watch(() => store.loading, (val) => {
        if (!val) { stop(); resolve() }
      })
    })
  }

  const [centerLat, centerLng] = wgs84ToGcj02(DEFAULT_CENTER[0], DEFAULT_CENTER[1])

  map = L.map(mapContainer.value, {
    center: [centerLat, centerLng],
    zoom: DEFAULT_ZOOM,
    zoomControl: false,
    attributionControl: false,
  })

  L.control.zoom({ position: 'topright' }).addTo(map)

  L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
    maxZoom: 18,
    subdomains: ['1', '2', '3', '4'],
  }).addTo(map)

  map.whenReady(() => {
    map?.invalidateSize()
  })

  map.on('click', () => {
    selectedEntry.value = null
  })

  map.on('zoomend', () => {
    renderMarkers()
  })

  renderMarkers()
  navigateToEntry()
})

onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer)
})

watch(entries, () => {
  nextTick(() => renderMarkers())
}, { deep: true })
</script>

<style scoped>
.slide-up-enter-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}
.slide-up-leave-active {
  transition: transform 0.2s ease-in, opacity 0.2s ease;
}
.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>