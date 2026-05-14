<template>
  <div class="bg-surface-card border border-white/5 rounded-2xl p-4">
    <div class="flex items-center gap-2 mb-3">
      <Database :size="16" class="text-accent" />
      <h3 class="text-sm font-bold">数据管理</h3>
    </div>

    <div v-if="importMsg" class="mb-3 px-3 py-2 rounded-lg text-xs" :class="importErr ? 'bg-accent-red/10 text-accent-red' : 'bg-accent-green/10 text-accent-green'">
      {{ importMsg }}
    </div>

    <div class="flex gap-2">
      <button
        @click="handleExport"
        class="flex-1 h-10 flex items-center justify-center gap-1.5 rounded-lg bg-accent/10 text-accent text-xs font-medium active:scale-[0.97] transition-transform"
      >
        <Download :size="14" />
        导出 JSON
      </button>
      <button
        @click="triggerImport"
        class="flex-1 h-10 flex items-center justify-center gap-1.5 rounded-lg bg-accent-green/10 text-accent-green text-xs font-medium active:scale-[0.97] transition-transform"
      >
        <Upload :size="14" />
        导入 JSON
      </button>
    </div>

    <button
      @click="handleClear"
      class="w-full h-10 mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-accent-red/5 text-accent-red/60 text-xs font-medium active:scale-[0.97] transition-transform"
    >
      <Trash2 :size="14" />
      清空所有数据
    </button>

    <input
      ref="fileInput"
      type="file"
      accept=".json"
      class="hidden"
      @change="handleImport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Download, Upload, Trash2, Database } from 'lucide-vue-next'
import { useEntriesStore } from '@/stores/entries'
import { useUserStore } from '@/stores/user'

const store = useEntriesStore()
const userStore = useUserStore()
const fileInput = ref<HTMLInputElement>()

const importMsg = ref('')
const importErr = ref(false)

function showImportResult(msg: string, isError = false) {
  importMsg.value = msg
  importErr.value = isError
  setTimeout(() => { importMsg.value = '' }, 3000)
}

function handleExport() {
  const json = JSON.stringify(store.entries, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `rider-pass-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function triggerImport() {
  fileInput.value?.click()
}

async function handleImport(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!userStore.isLoggedIn()) {
    showImportResult('请先在"我的"页面设置昵称', true)
    input.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = async () => {
    try {
      const data = JSON.parse(reader.result as string)
      if (!Array.isArray(data)) throw new Error('格式错误')
      let count = 0
      for (const item of data) {
        try {
          await store.addEntry({
            name: item.name || '',
            address: item.address || '',
            lat: item.lat || 0,
            lng: item.lng || 0,
            entrance: item.entrance || '',
            guardAttitude: item.guardAttitude ?? 1,
            elevatorAccess: item.elevatorAccess ?? true,
            tips: item.tips || '',
            contributor: userStore.nickname,
          }, userStore.userId)
          count++
        } catch {
          // skip duplicates
        }
      }
      showImportResult(`成功导入 ${count} 条情报`)
    } catch {
      showImportResult('JSON 格式不正确', true)
    }
  }
  reader.readAsText(file)
  input.value = ''
}

async function handleClear() {
  if (!confirm('确定要清空所有情报数据吗？此操作不可恢复！')) return
  const ids = [...store.entries.map(e => e.id)]
  for (const id of ids) {
    try { await store.removeEntry(id, userStore.userId) } catch { /* skip */ }
  }
  showImportResult('已清空所有数据')
}
</script>