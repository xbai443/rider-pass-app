import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useStorage } from '@/composables/useStorage'
import * as api from '@/api'

const USER_ID_KEY = 'rider_pass_user_id'
const NICKNAME_KEY = 'rider_pass_nickname'

export const useUserStore = defineStore('user', () => {
  const userId = ref(localStorage.getItem(USER_ID_KEY) || '')
  const nickname = ref(localStorage.getItem(NICKNAME_KEY) || '')
  const contributionCount = ref(0)
  const loading = ref(false)

  function persistIdentity() {
    localStorage.setItem(USER_ID_KEY, userId.value)
    localStorage.setItem(NICKNAME_KEY, nickname.value)
  }

  async function login(name: string) {
    loading.value = true
    try {
      const user = await api.loginUser(name)
      userId.value = user.id
      nickname.value = user.nickname
      persistIdentity()
    } catch (e) {
      console.error('登录失败:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function refreshProfile() {
    if (!userId.value) return
    try {
      const profile = await api.fetchUserProfile(userId.value)
      nickname.value = profile.nickname
      contributionCount.value = profile.contributionCount
      persistIdentity()
    } catch (e) {
      console.error('获取用户信息失败:', e)
    }
  }

  function setNickname(name: string) {
    nickname.value = name
    persistIdentity()
  }

  function isLoggedIn() {
    return !!userId.value
  }

  return { userId, nickname, contributionCount, loading, login, refreshProfile, setNickname, isLoggedIn, persistIdentity }
})