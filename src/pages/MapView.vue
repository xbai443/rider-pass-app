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
      class="absolute bottom-[96px] right-4 z-[1000] w-10 h-10 bg-surface-card border rounded-xl flex items-center justify-center active:scale-95 transition-all shadow-lg shadow-black/50"
      :class="watchId !== null ? 'border-accent text-accent' : 'border-white/5 text-white/60'"
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

    <GpsGuide
      :visible="gpsGuideVisible"
      reason="开启定位后可以看到自己的实时位置"
      @close="gpsGuideVisible = false"
      @retry="gpsGuideVisible = false; locateMe()"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import L from 'leaflet'
import { Crosshair } from 'lucide-vue-next'
import { useEntriesStore } from '@/stores/entries'
import { useUserStore } from '@/stores/user'
import { GUARD_COLORS, GUARD_EMOJIS, DEFAULT_CENTER, DEFAULT_ZOOM } from '@/utils/constants'
import { wgs84ToGcj02 } from '@/utils/coord'
import type { Entry, GuardAttitude } from '@/types'
import GpsGuide from '@/components/GpsGuide.vue'
import EntryPopup from '@/components/EntryPopup.vue'

const store = useEntriesStore()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const entries = computed(() => store.entries)

const mapContainer = ref<HTMLDivElement>()
const selectedEntry = ref<Entry | null>(null)
const toast = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null
const gpsGuideVisible = ref(false)

function showToast(msg: string, duration = 2500) {
  toast.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, duration)
}
let map: L.Map | null = null
let markersLayer: L.LayerGroup | null = null
let userLocationMarker: L.CircleMarker | null = null
let userLocationPulse: L.CircleMarker | null = null
let headingMarker: L.Marker | null = null
let destinationLine: L.Polyline | null = null
let watchId: number | null = null
let currentHeading = 0
const userLat = ref(0)
const userLng = ref(0)

function getZoomThreshold(zoom: number): number {
  if (zoom <= 6) return 1.0
  if (zoom <= 8) return 0.3
  if (zoom <= 10) return 0.08
  if (zoom <= 12) return 0.02
  if (zoom <= 13) return 0.008
  if (zoom <= 14) return 0.003
  if (zoom <= 15) return 0.001
  return 0.0003
}

function extractLabel(entries: Entry[]): string {
  const addr = entries[0]?.address || ''
  if (addr.includes('瑞安')) return '瑞安'
  if (addr.includes('鹿城')) return '鹿城'
  if (addr.includes('瓯海')) return '瓯海'
  if (addr.includes('龙湾')) return '龙湾'
  if (addr.includes('温州')) return '温州'
  if (entries.length >= 40) return '温州'
  return ''
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

function createClusterIcon(count: number, label: string, zoom: number) {
  const baseSize = count > 50 ? 60 : count > 20 ? 50 : count > 8 ? 44 : 38
  const countFontSize = count > 50 ? 14 : count > 20 ? 13 : count > 8 ? 12 : 11
  const hasLabel = label && zoom <= 10

  if (!hasLabel) {
    return L.divIcon({
      className: 'cluster-marker',
      html: `<div style="
        width: ${baseSize}px; height: ${baseSize}px;
        background: #3b82f6;
        border: 2.5px solid #ffffff33;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${countFontSize}px;
        font-weight: 700;
        color: #fff;
        box-shadow: 0 0 18px #3b82f644;
        cursor: pointer;
      ">${count}</div>`,
      iconSize: [baseSize, baseSize],
      iconAnchor: [Math.round(baseSize / 2), Math.round(baseSize / 2)],
    })
  }

  const w = Math.max(90, label.length * 16 + 40 + count.toString().length * 10)
  const h = 56
  return L.divIcon({
    className: 'cluster-marker',
    html: `<div style="
      display: flex;
      align-items: center;
      gap: 8px;
      background: #1e293bdd;
      backdrop-filter: blur(8px);
      border: 2px solid #3b82f666;
      border-radius: 28px;
      padding: 6px 16px 6px 6px;
      box-shadow: 0 4px 24px #00000044;
      cursor: pointer;
      white-space: nowrap;
    ">
      <div style="
        width: 42px; height: 42px;
        background: #3b82f6;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 700;
        color: #fff;
        flex-shrink: 0;
      ">${count}</div>
      <span style="font-size: 15px; font-weight: 600; color: #e2e8f0;">${label}</span>
    </div>`,
    iconSize: [w, h],
    iconAnchor: [Math.round(w / 2), Math.round(h / 2)],
  })
}

function renderMarkers() {
  if (!map) return
  if (markersLayer) {
    markersLayer.clearLayers()
  } else {
    markersLayer = L.layerGroup().addTo(map)
  }

  if (entries.value.length === 0) return

  const zoom = map.getZoom()
  const threshold = getZoomThreshold(zoom)
  const clusters: Map<string, Entry[]> = new Map()

  for (const entry of entries.value) {
    const [gcjLat, gcjLng] = wgs84ToGcj02(entry.lat, entry.lng)
    const gridLat = Math.round(gcjLat / threshold)
    const gridLng = Math.round(gcjLng / threshold)
    const key = `${gridLat},${gridLng}`
    if (!clusters.has(key)) clusters.set(key, [])
    clusters.get(key)!.push(entry)
  }

  for (const [, group] of clusters) {
    if (group.length === 1 && zoom > 10) {
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
      const label = extractLabel(group)
      const marker = L.marker([cx, cy], {
        icon: createClusterIcon(group.length, label, zoom),
      })
      marker.on('click', () => {
        if (map) {
          const targetZoom = zoom < 10 ? 10 : Math.min(zoom + 2, 17)
          map.setView([cx, cy], targetZoom, { animate: true })
        }
      })
      markersLayer.addLayer(marker)
    }
  }
}

function createHeadingIcon(heading: number) {
  return L.divIcon({
    className: 'heading-marker',
    html: `<div style="
      width: 0; height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-bottom: 20px solid #3B82F6;
      transform: rotate(${heading}deg);
      filter: drop-shadow(0 2px 4px #00000044);
      transition: transform 0.3s ease;
    " />`,
    iconSize: [20, 22],
    iconAnchor: [10, 28],
  })
}

function updateHeading(heading: number | null) {
  if (heading === null) return
  currentHeading = heading
  const [gcjLat, gcjLng] = wgs84ToGcj02(userLat.value, userLng.value)
  if (headingMarker && isFinite(gcjLat)) {
    headingMarker.setLatLng([gcjLat, gcjLng])
    headingMarker.setIcon(createHeadingIcon(heading))
  }
}

function updateDestinationLine() {
  if (destinationLine) {
    destinationLine.remove()
    destinationLine = null
  }
  if (!selectedEntry.value || !userLat.value || !userLng.value) return
  if (!isFinite(userLat.value) || !isFinite(userLng.value)) return

  const [myLat, myLng] = wgs84ToGcj02(userLat.value, userLng.value)
  const [destLat, destLng] = wgs84ToGcj02(selectedEntry.value.lat, selectedEntry.value.lng)

  destinationLine = L.polyline([[myLat, myLng], [destLat, destLng]], {
    color: '#3B82F6',
    weight: 2.5,
    dashArray: '8 6',
    opacity: 0.7,
  }).addTo(map!)

  const arrowCount = Math.max(1, Math.floor(destinationLine.getLatLngs().length / 3))
  for (let i = 1; i <= arrowCount; i++) {
    const ratio = i / (arrowCount + 1)
    const lat = myLat + (destLat - myLat) * ratio
    const lng = myLng + (destLng - myLng) * ratio
    const angle = Math.atan2(destLat - myLat, destLng - myLng) * 180 / Math.PI
    L.marker([lat, lng], {
      icon: L.divIcon({
        className: '',
        html: `<div style="
          width: 0; height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-bottom: 10px solid #3B82F688;
          transform: rotate(${angle + 90}deg);
        " />`,
        iconSize: [10, 12],
        iconAnchor: [5, 6],
      }),
      interactive: false,
    }).addTo(map!)
  }
}

function updateUserLocation(lat: number, lng: number, zoomTo = true) {
  if (!map) return
  userLat.value = lat
  userLng.value = lng
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

  if (headingMarker) {
    headingMarker.setLatLng([gcjLat, gcjLng])
  } else {
    headingMarker = L.marker([gcjLat, gcjLng], {
      icon: createHeadingIcon(currentHeading),
      interactive: false,
    }).addTo(map)
  }

  userLocationPulse.bringToBack()
  userLocationMarker.bringToFront()
  ;(headingMarker as any).bringToFront()

  updateDestinationLine()
}

function startTracking() {
  if (!navigator.geolocation) {
    showToast('设备不支持定位')
    return
  }
  if (watchId !== null) return

  navigator.geolocation.getCurrentPosition(
    (pos) => updateUserLocation(pos.coords.latitude, pos.coords.longitude),
    (err) => {
      if (err.code === err.PERMISSION_DENIED) gpsGuideVisible.value = true
      else showToast('定位失败，请检查网络或室外重试')
    },
    { enableHighAccuracy: true, timeout: 5000 }
  )

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      updateUserLocation(pos.coords.latitude, pos.coords.longitude, false)
    },
    () => {},
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
  )

  if ('ondeviceorientationabsolute' in window) {
    window.addEventListener('deviceorientationabsolute', onOrientation)
  } else {
    window.addEventListener('deviceorientation', onOrientation)
  }
}

function onOrientation(event: DeviceOrientationEvent) {
  const heading = (event as any).webkitCompassHeading ?? event.alpha
  if (heading !== null && heading !== undefined) {
    updateHeading(heading)
  }
}

function locateMe() {
  if (watchId !== null) {
    stopTracking()
    return
  }
  startTracking()
}

function stopTracking() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId)
    watchId = null
  }
  window.removeEventListener('deviceorientationabsolute', onOrientation)
  window.removeEventListener('deviceorientation', onOrientation)
  if (headingMarker) {
    headingMarker.remove()
    headingMarker = null
  }
  if (destinationLine) {
    destinationLine.remove()
    destinationLine = null
  }
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
      const entry = entries.value.find(e => e.id === String(id))
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

  if (entries.value.length === 0 && store.loading) {
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

watch(entries, () => {
  renderMarkers()
})

watch(selectedEntry, () => {
  updateDestinationLine()
})

onUnmounted(() => {
  stopTracking()
  markersLayer?.clearLayers()
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