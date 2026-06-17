import type { RunSession, UserProfile } from '../types.ts'

const MS_PER_DAY = 86_400_000

export function getZombieCount(fitnessLevel: number): number {
  return Math.min(6, Math.max(1, Math.round(1 + fitnessLevel / 2)))
}

export function getSpawnRadiusMeters(fitnessLevel: number): number {
  return Math.max(120, 450 - fitnessLevel * 35)
}

export function getZombieSpeedMps(fitnessLevel: number): number {
  const mph = 1 + Math.min(fitnessLevel, 8) * 0.06
  return mph * 0.44704
}

export function updateProfileAfterSession(
  profile: UserProfile,
  session: RunSession,
): UserProfile {
  const updated: UserProfile = {
    ...profile,
    lastRunAt: session.endedAt,
    totalSessions: profile.totalSessions + 1,
  }

  if (session.isCalibration) {
    updated.calibrated = true
    updated.baselinePaceMinPerKm = session.averagePaceMinPerKm
    updated.baselineDistanceMeters = session.distanceMeters
    updated.fitnessLevel = 1
    return updated
  }

  const paceImprovement =
    (profile.baselinePaceMinPerKm - session.averagePaceMinPerKm) /
    profile.baselinePaceMinPerKm
  const distanceImprovement =
    (session.distanceMeters - profile.baselineDistanceMeters) /
    Math.max(profile.baselineDistanceMeters, 1)

  const performanceScore = paceImprovement * 0.6 + distanceImprovement * 0.4

  if (performanceScore > 0.05) {
    updated.fitnessLevel = Math.min(10, profile.fitnessLevel + 1)
    updated.baselinePaceMinPerKm =
      profile.baselinePaceMinPerKm * 0.7 + session.averagePaceMinPerKm * 0.3
    updated.baselineDistanceMeters =
      profile.baselineDistanceMeters * 0.7 + session.distanceMeters * 0.3
  } else if (performanceScore < -0.1) {
    updated.fitnessLevel = Math.max(1, profile.fitnessLevel - 1)
  }

  if (profile.lastRunAt) {
    const daysSinceLastRun =
      (Date.parse(session.startedAt) - Date.parse(profile.lastRunAt)) / MS_PER_DAY
    if (daysSinceLastRun > 7) {
      updated.fitnessLevel = Math.max(1, updated.fitnessLevel - 1)
    }
  }

  return updated
}
