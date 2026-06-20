import { offsetLatLng } from '../geo/haversine.ts'
import { getSpawnRadiusMeters, getZombieSpeedMps } from '../fitness/difficulty.ts'
import type { LatLng, ZombieState } from '../types.ts'
import { advanceAlongRoute, routeFootPath, snapToFootPath } from './pathfinding.ts'

let zombieCounter = 0

function createId(): string {
  zombieCounter += 1
  return `zombie-${zombieCounter}`
}

export class ZombieManager {
  private zombies: ZombieState[] = []
  private fitnessLevel = 1
  private rerouteInFlight = new Set<string>()

  setFitnessLevel(level: number): void {
    this.fitnessLevel = level
  }

  getZombies(): ZombieState[] {
    return this.zombies
  }

  async spawnNear(origin: LatLng, count: number): Promise<void> {
    const radius = getSpawnRadiusMeters(this.fitnessLevel)
    const speed = getZombieSpeedMps(this.fitnessLevel)
    const spawned: ZombieState[] = []

    for (let i = 0; i < count; i++) {
      const angle = (360 / count) * i + Math.random() * 40
      const distance = radius * (0.6 + Math.random() * 0.4)
      const raw = offsetLatLng(origin, distance, angle)
      const position = await snapToFootPath(raw)
      const route = await routeFootPath(position, origin)

      spawned.push({
        id: createId(),
        position,
        route,
        routeIndex: 1,
        speedMps: speed,
        lastRouteUpdate: Date.now(),
        wasNearRunner: false,
      })
    }

    this.zombies = spawned
  }

  update(runner: LatLng, deltaSeconds: number): void {
    const now = Date.now()

    for (const zombie of this.zombies) {
      if (
        now - zombie.lastRouteUpdate > 12_000 &&
        !this.rerouteInFlight.has(zombie.id)
      ) {
        this.rerouteInFlight.add(zombie.id)
        void this.rerouteZombie(zombie, runner)
      }

      const moved = advanceAlongRoute(
        zombie.route,
        zombie.routeIndex,
        zombie.position,
        zombie.speedMps * deltaSeconds,
      )
      zombie.position = moved.position
      zombie.routeIndex = moved.routeIndex
    }
  }

  private async rerouteZombie(zombie: ZombieState, runner: LatLng): Promise<void> {
    try {
      zombie.route = await routeFootPath(zombie.position, runner)
      zombie.routeIndex = 1
      zombie.lastRouteUpdate = Date.now()
    } finally {
      this.rerouteInFlight.delete(zombie.id)
    }
  }

  reset(): void {
    this.zombies = []
  }
}

export function nearestZombieDistance(runner: LatLng, zombies: ZombieState[]): number {
  if (zombies.length === 0) return Infinity

  let min = Infinity
  for (const zombie of zombies) {
    const d = quickDistance(runner, zombie.position)
    if (d < min) min = d
  }
  return min
}

function quickDistance(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const R = 6371000
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export const PROXIMITY_ALERT_M = 60
export const CAUGHT_DISTANCE_M = 15
