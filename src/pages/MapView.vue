<template>
  <div class="relative w-full h-full">
    <div ref="mapContainer" class="w-full h-full" style="min-height: 100%;" />

    <div class="absolute top-0 left-0 right-0 px-4 pt-4 pb-8 bg-gradient-to-b from-black/80 to-transparent z-[400] pointer-events-none">
      <h1 class="text-lg font-bold tracking-wide">骑手通行证</h1>
      <p class="text-xs text-white/50 mt-0.5">{{ entries.length }} 条情报</p>
    </div>

    <button
      @click="locateMe"
      class="absolute bottom-[88px] right-4 z-[1000] w-10 h-10 bg-surface-card border border-white/5 rounded-xl flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-black/50"
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
let spiderLines: L.Polyline[] = []
let userLocationMarker: L.CircleMarker | null = null
let userLocationPulse: L.CircleMarker | null = null
const PROXIMITY_THRESHOLD = 0.0005

function getClusterKey(lat: number, lng: number): string {
  const gridLat = Math.round(lat / PROXIMITY_THRESHOLD)
  const gridLng = Math.round(lng / PROXIMITY_THRESHOLD)
  return `${gridLat},${gridLng}`
}

function spiderfy(clusterCenter: [number, number], entries: Entry[], map: L.Map) {
  clearSpiderLines()

  const count = entries.length
  const radius = count <= 3 ? 40 : count <= 6 ? 55 : 70
  const startAngle = -Math.PI / 2

  for (let i = 0; i < count; i++) {
    const angle = startAngle + (2 * Math.PI * i) / count
    const offsetLat = (radius * Math.sin(angle)) / 111320
    const offsetLng = (radius * Math.cos(angle)) / (111320 * Math.cos(clusterCenter[0] * Math.PI / 180))

    const targetLat = clusterCenter[0] + offsetLat
    const targetLng = clusterCenter[1] + offsetLng

    const originalMarker = document.querySelector(`.custom-marker[data-entry-id="${entries[i].id}"]`)
    if (originalMarker) {
      const parent = originalMarker.parentElement as HTMLElement
      if (parent) {
        parent.style.transform = `translate(${(targetLng - clusterCenter[1]) * 111320 * Math.cos(clusterCenter[0] * Math.PI / 180)}px, ${-(targetLat - clusterCenter[0]) * 111320}px)`
        parent.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        parent.style.zIndex = '1000'
      }
    }

    const line = L.polyline([clusterCenter, [targetLat, targetLng]], {
      color: '#ffffff44',
      weight: 1.5,
      dashArray: '3 4',
    }).addTo(map)
    spiderLines.push(line)
  }
}

function clearSpiderLines() {
  spiderLines.forEach(l => l.remove())
  spiderLines = []
  document.querySelectorAll('.custom-marker').forEach(el => {
    const parent = el.parentElement as HTMLElement
    if (parent) {
      parent.style.transform = ''
      parent.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      parent.style.zIndex = ''
    }
  })
}

function findClusterEntries(clickedEntry: Entry): { center: [number, number]; entries: Entry[] } | null {
  const [gcjLat, gcjLng] = wgs84ToGcj02(clickedEntry.lat, clickedEntry.lng)
  const key = getClusterKey(gcjLat, gcjLng)

  const neighbors: Entry[] = []
  for (const e of entries) {
    const [eLat, eLng] = wgs84ToGcj02(e.lat, e.lng)
    const eKey = getClusterKey(eLat, eLng)
    if (eKey === key) {
      neighbors.push(e)
    }
  }

  if (neighbors.length <= 1) return null

  let sumLat = 0, sumLng = 0
  for (const e of neighbors) {
    const [eLat, eLng] = wgs84ToGcj02(e.lat, e.lng)
    sumLat += eLat
    sumLng += eLng
  }
  return {
    center: [sumLat / neighbors.length, sumLng / neighbors.length],
    entries: neighbors,
  }
}

function createIcon(attitude: GuardAttitude, entryId: string) {
  const color = GUARD_COLORS[attitude]
  const emoji = GUARD_EMOJIS[attitude]
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 44px; height: 44px;
      background: ${color}22;
      border: 2.5px solid ${color};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      box-shadow: 0 0 14px ${color}44;
      cursor: pointer;
      transition: transform 0.2s ease;
    " data-entry-id="${entryId}">${emoji}</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  })
}

function renderMarkers() {
  if (!map) return
  if (markersLayer) {
    markersLayer.clearLayers()
  } else {
    markersLayer = L.layerGroup().addTo(map)
  }

  for (const entry of entries) {
    const [gcjLat, gcjLng] = wgs84ToGcj02(entry.lat, entry.lng)
    const marker = L.marker([gcjLat, gcjLng], {
      icon: createIcon(entry.guardAttitude, entry.id),
    })

    marker.on('click', () => {
      const cluster = findClusterEntries(entry)
      if (cluster && cluster.entries.length > 1) {
        clearSpiderLines()
        spiderfy(cluster.center, cluster.entries, map!)
      }
      selectedEntry.value = entry
    })

    markersLayer.addLayer(marker)
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
    clearSpiderLines()
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