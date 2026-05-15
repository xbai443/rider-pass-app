<template>
  <form @submit.prevent="submit" class="space-y-4">
    <div class="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 flex items-center gap-3">
      <MapPin :size="16" class="text-accent flex-shrink-0" />
      <div class="flex-1 min-w-0">
        <p class="text-xs text-white/40">当前位置</p>
        <p class="text-sm truncate">{{ geoAddress || (gpsLoading ? '定位中...' : '点击右侧按钮定位') }}</p>
      </div>
      <button type="button" @click="getGPS" :disabled="gpsLoading" class="flex-shrink-0 w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center active:scale-95 transition-transform">
        <Crosshair :size="14" class="text-accent" :class="{ 'animate-spin': gpsLoading }" />
      </button>
    </div>

    <div v-if="nearbyEntries.length > 0" class="space-y-2">
      <p class="text-xs text-white/30">附近已有情报，快速确认：</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="entry in nearbyEntries"
          :key="entry.id"
          type="button"
          @click="quickFill(entry)"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/5 bg-surface-card hover:bg-surface-hover active:scale-95 transition-all text-sm"
        >
          <span>{{ GUARD_EMOJIS_MAP[entry.guardAttitude] }}</span>
          <span class="text-white/80">{{ entry.name }}</span>
          <span class="text-[10px] text-white/20">距离{{ entry._distance }}</span>
        </button>
      </div>
      <div class="h-px bg-white/5"></div>
    </div>

    <div class="relative">
      <label class="text-xs text-white/40 block mb-1.5">小区/楼宇名称</label>
      <input
        v-model="form.name"
        type="text"
        required
        placeholder="输入名称搜索或新建"
        @focus="showSuggestions = true"
        @blur="hideSuggestions"
        @input="filterSuggestions"
        class="w-full h-12 bg-surface-card border border-white/5 rounded-xl px-4 text-white placeholder:text-white/15 outline-none focus:border-accent/50 transition-colors"
      />
      <div v-if="showSuggestions && suggestions.length > 0" class="absolute left-0 right-0 top-full mt-1 bg-surface-card border border-white/10 rounded-xl overflow-hidden z-50 shadow-xl shadow-black/50">
        <button
          v-for="s in suggestions"
          :key="s"
          type="button"
          @mousedown.prevent="selectSuggestion(s)"
          class="w-full h-10 px-4 text-left text-sm hover:bg-white/5 transition-colors flex items-center gap-2"
        >
          <Search :size="12" class="text-white/20 flex-shrink-0" />
          <span class="truncate">{{ s }}</span>
        </button>
      </div>
    </div>

    <div>
      <label class="text-xs text-white/40 block mb-1.5">保安态度</label>
      <div class="grid grid-cols-4 gap-2">
        <button
          v-for="(item, idx) in attitudeOptions"
          :key="idx"
          type="button"
          @click="form.guardAttitude = idx as GuardAttitude"
          class="h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all active:scale-95"
          :class="form.guardAttitude === idx
            ? 'border-current shadow-lg'
            : 'border-white/5 bg-surface-card'"
          :style="form.guardAttitude === idx ? { color: item.color, borderColor: item.color, backgroundColor: item.color + '15' } : {}"
        >
          <span class="text-xl leading-none">{{ item.emoji }}</span>
          <span class="text-[10px]" :class="form.guardAttitude === idx ? '' : 'text-white/30'">{{ item.label }}</span>
        </button>
      </div>
    </div>

    <button
      type="button"
      @click="showMore = !showMore"
      class="w-full h-10 flex items-center justify-center gap-1.5 rounded-lg bg-white/[0.03] text-white/30 text-xs hover:text-white/50 transition-colors"
    >
      <ChevronDown :size="14" :class="{ 'rotate-180': showMore }" class="transition-transform" />
      {{ showMore ? '收起更多选项' : '补充更多（入口、电梯、备注）' }}
    </button>

    <div v-if="showMore" class="space-y-4">
      <div>
        <label class="text-xs text-white/40 block mb-1.5">入口描述</label>
        <input
          v-model="form.entrance"
          type="text"
          placeholder="哪个门能进？怎么走？"
          class="w-full h-12 bg-surface-card border border-white/5 rounded-xl px-4 text-white placeholder:text-white/15 outline-none focus:border-accent/50 transition-colors"
        />
      </div>

      <div>
        <label class="text-xs text-white/40 block mb-1.5">电梯能否上楼</label>
        <div class="flex gap-2">
          <button
            type="button"
            @click="form.elevatorAccess = true"
            class="flex-1 h-12 rounded-xl border transition-all active:scale-95 font-medium text-sm"
            :class="form.elevatorAccess
              ? 'bg-accent-green/15 border-accent-green text-accent-green'
              : 'bg-surface-card border-white/5 text-white/30'"
          >
            可以上楼
          </button>
          <button
            type="button"
            @click="form.elevatorAccess = false"
            class="flex-1 h-12 rounded-xl border transition-all active:scale-95 font-medium text-sm"
            :class="!form.elevatorAccess
              ? 'bg-accent-red/15 border-accent-red text-accent-red'
              : 'bg-surface-card border-white/5 text-white/30'"
          >
            不能上楼
          </button>
        </div>
      </div>

      <div>
        <label class="text-xs text-white/40 block mb-1.5">备注</label>
        <input
          v-model="form.tips"
          type="text"
          placeholder="如：晚上8点后北门锁了"
          class="w-full h-12 bg-surface-card border border-white/5 rounded-xl px-4 text-white placeholder:text-white/15 outline-none focus:border-accent/50 transition-colors"
        />
      </div>
    </div>

    <button
      type="submit"
      :disabled="!formValid || submitting"
      class="w-full h-12 rounded-xl bg-accent text-white font-bold text-sm active:scale-[0.98] transition-all disabled:opacity-30 disabled:active:scale-100"
    >
      {{ submitting ? '提交中...' : '提交情报 ✓' }}
    </button>

    <GpsGuide
      :visible="gpsGuideVisible"
      reason="开启定位后可以自动获取当前地址"
      @close="gpsGuideVisible = false"
      @retry="gpsGuideVisible = false; getGPS()"
    />
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { MapPin, Crosshair, Search, ChevronDown } from 'lucide-vue-next'
import { useEntriesStore } from '@/stores/entries'
import { useUserStore } from '@/stores/user'
import { GUARD_EMOJIS } from '@/utils/constants'
import type { GuardAttitude, Entry } from '@/types'
import GpsGuide from '@/components/GpsGuide.vue'

interface NearbyEntry extends Entry {
  _distance: string
}

const GUARD_EMOJIS_MAP: Record<GuardAttitude, string> = {
  0: GUARD_EMOJIS[0],
  1: GUARD_EMOJIS[1],
  2: GUARD_EMOJIS[2],
  3: GUARD_EMOJIS[3],
}

const props = defineProps<{
  initialLat?: number
  initialLng?: number
}>()

const emit = defineEmits<{ submitted: [] }>()
const entriesStore = useEntriesStore()
const userStore = useUserStore()

const gpsLoading = ref(false)
const gpsGuideVisible = ref(false)
const submitting = ref(false)
const geoAddress = ref('')
const showSuggestions = ref(false)
const showMore = ref(false)
const suggestions = ref<string[]>([])
const nearbyEntries = ref<NearbyEntry[]>([])

const form = reactive({
  name: '',
  address: '',
  lat: 0,
  lng: 0,
  guardAttitude: 0 as GuardAttitude,
  entrance: '',
  elevatorAccess: true,
  tips: '',
})

const attitudeOptions = [
  { emoji: GUARD_EMOJIS[0], label: '友好', color: '#4ade80' },
  { emoji: GUARD_EMOJIS[1], label: '一般', color: '#facc15' },
  { emoji: GUARD_EMOJIS[2], label: '严格', color: '#f97316' },
  { emoji: GUARD_EMOJIS[3], label: '拒绝', color: '#ef4444' },
]

const formValid = computed(() => {
  return form.name.trim() && form.lat && form.lng
})

function findNearbyEntries(lat: number, lng: number) {
  return entriesStore.entries
    .filter(e => {
      const dLat = Math.abs(e.lat - lat)
      const dLng = Math.abs(e.lng - lng)
      return dLat < 0.004 && dLng < 0.004
    })
    .map(e => {
      const dLat = Math.abs(e.lat - lat) * 111000
      const dLng = Math.abs(e.lng - lng) * 111000 * Math.cos(lat * Math.PI / 180)
      const d = Math.round(Math.sqrt(dLat * dLat + dLng * dLng))
      return { ...e, _distance: d < 1000 ? `${d}m` : `${(d / 1000).toFixed(1)}km` }
    })
    .sort((a, b) => {
      const da = parseInt(a._distance)
      const db = parseInt(b._distance)
      return da - db
    })
    .slice(0, 4)
}

function quickFill(entry: NearbyEntry) {
  form.name = entry.name
  form.guardAttitude = entry.guardAttitude
  form.entrance = entry.entrance
  form.elevatorAccess = entry.elevatorAccess
  form.tips = entry.tips
}

function filterSuggestions() {
  const q = form.name.trim().toLowerCase()
  if (!q) {
    suggestions.value = []
    return
  }
  const names = new Set(entriesStore.entries.map(e => e.name))
  suggestions.value = Array.from(names)
    .filter(n => n.toLowerCase().includes(q))
    .slice(0, 5)
}

function selectSuggestion(name: string) {
  form.name = name
  showSuggestions.value = false
}

function hideSuggestions() {
  setTimeout(() => { showSuggestions.value = false }, 150)
}

async function reverseGeocode(lat: number, lng: number) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&accept-language=zh`)
    const data = await res.json()
    if (data.display_name) {
      geoAddress.value = data.display_name
      if (data.address) {
        const addr = data.address
        form.address = [addr.city || addr.town || addr.county, addr.road || addr.suburb, addr.house_number].filter(Boolean).join('') || data.display_name
      }
    }
    nearbyEntries.value = findNearbyEntries(lat, lng)
  } catch {
    geoAddress.value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  }
}

onMounted(() => {
  if (props.initialLat && props.initialLng) {
    form.lat = props.initialLat
    form.lng = props.initialLng
    reverseGeocode(props.initialLat, props.initialLng)
  } else {
    getGPS()
  }
})

function getGPS() {
  if (!navigator.geolocation) return
  gpsLoading.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      form.lat = pos.coords.latitude
      form.lng = pos.coords.longitude
      reverseGeocode(form.lat, form.lng)
      gpsLoading.value = false
    },
    (err) => {
      gpsLoading.value = false
      if (err.code === err.PERMISSION_DENIED) {
        gpsGuideVisible.value = true
      } else {
        geoAddress.value = '定位失败，请手动输入'
      }
    },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

async function submit() {
  if (!formValid.value || submitting.value) return
  submitting.value = true

  try {
    await entriesStore.addEntry({
      name: form.name.trim(),
      address: form.address || geoAddress.value || form.name.trim(),
      lat: form.lat,
      lng: form.lng,
      guardAttitude: form.guardAttitude,
      entrance: form.entrance.trim(),
      elevatorAccess: form.elevatorAccess,
      tips: form.tips.trim(),
      contributor: userStore.nickname || '匿名骑手',
    }, userStore.userId)
    userStore.refreshProfile()

    form.name = ''
    form.address = ''
    form.entrance = ''
    form.tips = ''
    form.guardAttitude = 0
    form.elevatorAccess = true
    showMore.value = false
    submitting.value = false

    emit('submitted')
  } catch {
    submitting.value = false
  }
}
</script>