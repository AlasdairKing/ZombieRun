import { bearingDegrees, haversineMeters } from '../geo/haversine.ts'
import type { GeoPosition } from '../geo/geolocation.ts'
import { CAUGHT_DISTANCE_M, nearestZombieDistance } from '../zombies/zombieManager.ts'
import type { LatLng, RunSession, ZombieState } from '../types.ts'

const ROUTE_CHANGE_ANGLE = 55
const ROUTE_CHANGE_MIN_SPEED_MPS = 0.8
const MIN_POINT_DISTANCE_M = 4

export class SessionTracker {
  readonly startedAt = new Date()
  readonly isCalibration: boolean
  readonly zombieCount: number

  private route: LatLng[] = []
  private lastPosition: LatLng | null = null
  private lastBearing: number | null = null
  private lastTimestamp: number | null = null
  private distanceMeters = 0
  private routeChanges = 0
  private zombiesAvoided = 0
  private caught = false

  constructor(isCalibration: boolean, zombieCount: number) {
    this.isCalibration = isCalibration
    this.zombieCount = zombieCount
  }

  wasCaught(): boolean {
    return this.caught
  }

  addPosition(position: GeoPosition): void {
    const point = position.coords

    if (this.lastPosition) {
      const segment = haversineMeters(this.lastPosition, point)
      if (segment >= MIN_POINT_DISTANCE_M) {
        this.distanceMeters += segment

        const bearing = bearingDegrees(this.lastPosition, point)
        const dt =
          this.lastTimestamp !== null
            ? Math.max(0.001, (position.timestamp - this.lastTimestamp) / 1000)
            : 1
        const speed = segment / dt

        if (
          this.lastBearing !== null &&
          speed >= ROUTE_CHANGE_MIN_SPEED_MPS &&
          angleDiff(this.lastBearing, bearing) >= ROUTE_CHANGE_ANGLE
        ) {
          this.routeChanges += 1
        }

        this.lastBearing = bearing
        this.route.push(point)
      }
    } else {
      this.route.push(point)
    }

    this.lastPosition = point
    this.lastTimestamp = position.timestamp
  }

  trackZombieProximity(runner: LatLng, zombies: ZombieState[]): void {
    const nearest = nearestZombieDistance(runner, zombies)

    if (nearest <= CAUGHT_DISTANCE_M) {
      this.caught = true
    }

    for (const zombie of zombies) {
      const dist = haversineMeters(runner, zombie.position)
      if (dist <= 35) {
        zombie.wasNearRunner = true
      } else if (zombie.wasNearRunner && dist >= 50) {
        zombie.wasNearRunner = false
        this.zombiesAvoided += 1
      }
    }
  }

  getElapsedSeconds(): number {
    return Math.floor((Date.now() - this.startedAt.getTime()) / 1000)
  }

  getDistanceMeters(): number {
    return this.distanceMeters
  }

  getAveragePaceMinPerKm(): number {
    if (this.distanceMeters < 50) return 0
    const km = this.distanceMeters / 1000
    const minutes = this.getElapsedSeconds() / 60
    return minutes / km
  }

  getRoute(): LatLng[] {
    return this.route
  }

  getLastPosition(): LatLng | null {
    return this.lastPosition
  }

  finish(): RunSession {
    const endedAt = new Date()
    const durationSeconds = Math.floor(
      (endedAt.getTime() - this.startedAt.getTime()) / 1000,
    )

    return {
      id: crypto.randomUUID(),
      startedAt: this.startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
      distanceMeters: this.distanceMeters,
      durationSeconds,
      averagePaceMinPerKm: this.getAveragePaceMinPerKm(),
      route: this.route,
      zombiesAvoided: this.zombiesAvoided,
      routeChanges: this.routeChanges,
      zombieCount: this.zombieCount,
      isCalibration: this.isCalibration,
    }
  }
}

function angleDiff(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360
  return diff > 180 ? 360 - diff : diff
}

export function formatPace(minPerKm: number): string {
  if (!minPerKm || !Number.isFinite(minPerKm)) return '--:--'
  const minutes = Math.floor(minPerKm)
  const seconds = Math.round((minPerKm - minutes) * 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`
  return `${Math.round(meters)} m`
}
