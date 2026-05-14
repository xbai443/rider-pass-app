export type GuardAttitude = 0 | 1 | 2 | 3

export interface Entry {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  entrance: string
  guardAttitude: GuardAttitude
  elevatorAccess: boolean
  tips: string
  contributor: string
  createdAt: number
  votes: { up: number; down: number }
}

export interface User {
  nickname: string
  contributionCount: number
  joinedAt: number
}

export interface AppMeta {
  version: string
  lastExportAt: number | null
}