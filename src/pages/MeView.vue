<template>
  <div class="w-full h-full overflow-y-auto pb-16">
    <div class="max-w-lg mx-auto px-4 pt-6">
      <h1 class="text-xl font-bold mb-1">我的</h1>
      <p class="text-sm text-white/40 mb-6">个人中心 & 数据管理</p>

      <div class="bg-surface-card border border-white/5 rounded-2xl p-4 mb-4">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
            <User :size="22" class="text-accent" />
          </div>
          <div>
            <input
              :value="userStore.nickname"
              @input="onNicknameChange"
              type="text"
              placeholder="设置昵称..."
              maxlength="12"
              class="bg-transparent text-base font-bold outline-none placeholder:text-white/20 w-full"
            />
            <p class="text-xs text-white/30">贡献 {{ userStore.contributionCount }} 条情报</p>
          </div>
        </div>
      </div>

      <RankList class="mb-4" />
      <DataManager class="mb-4" />

      <p class="text-center text-xs text-white/10 mt-8">骑手通行证 v1.0 — 骑手帮骑手</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User } from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'
import RankList from '@/components/RankList.vue'
import DataManager from '@/components/DataManager.vue'

const userStore = useUserStore()

async function onNicknameChange(e: Event) {
  const value = (e.target as HTMLInputElement).value
  userStore.setNickname(value)
  if (value.trim()) {
    await userStore.login(value.trim())
  }
}
</script>