export interface LatLng {
  lat: number
  lng: number
}

export interface RunSession {
  id: string
  startedAt: string
  endedAt: string
  distanceMeters: number
  durationSeconds: number
  averagePaceMinPerKm: number
  route: LatLng[]
  zombiesAvoided: number
  routeChanges: number
  zombieCount: number
  isCalibration: boolean
}

export interface UserProfile {
  calibrated: boolean
  fitnessLevel: number
  baselinePaceMinPerKm: number
  baselineDistanceMeters: number
  lastRunAt: string | null
  totalSessions: number
}

export interface ZombieState {
  id: string
  position: LatLng
  route: LatLng[]
  routeIndex: number
  speedMps: number
  lastRouteUpdate: number
  wasNearRunner: boolean
}

export type AppScreen = 'home' | 'run' | 'summary' | 'history'
