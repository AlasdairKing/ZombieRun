import type { UserProfile } from '../types.ts'

const STORAGE_KEY = 'zombierun-profile'

const DEFAULT_PROFILE: UserProfile = {
  calibrated: false,
  fitnessLevel: 1,
  baselinePaceMinPerKm: 7,
  baselineDistanceMeters: 2000,
  lastRunAt: null,
  totalSessions: 0,
}

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_PROFILE }
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_PROFILE }
  }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}
