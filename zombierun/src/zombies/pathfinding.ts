import type { LatLng } from '../types.ts'

const OSRM_BASE = 'https://router.project-osrm.org'

interface OsrmRouteResponse {
  routes?: Array<{
    geometry: {
      coordinates: [number, number][]
    }
  }>
}

interface OsrmNearestResponse {
  waypoints?: Array<{
    location: [number, number]
  }>
}

export async function snapToFootPath(point: LatLng): Promise<LatLng> {
  try {
    const url = `${OSRM_BASE}/nearest/v1/foot/${point.lng},${point.lat}?number=1`
    const res = await fetch(url)
    if (!res.ok) return point

    const data = (await res.json()) as OsrmNearestResponse
    const location = data.waypoints?.[0]?.location
    if (!location) return point

    return { lat: location[1], lng: location[0] }
  } catch {
    return point
  }
}

export async function routeFootPath(from: LatLng, to: LatLng): Promise<LatLng[]> {
  try {
    const url =
      `${OSRM_BASE}/route/v1/foot/${from.lng},${from.lat};${to.lng},${to.lat}` +
      '?overview=full&geometries=geojson&steps=false'

    const res = await fetch(url)
    if (!res.ok) return [from, to]

    const data = (await res.json()) as OsrmRouteResponse
    const coords = data.routes?.[0]?.geometry.coordinates
    if (!coords?.length) return [from, to]

    return coords.map(([lng, lat]) => ({ lat, lng }))
  } catch {
    return [from, to]
  }
}

export function advanceAlongRoute(
  route: LatLng[],
  routeIndex: number,
  position: LatLng,
  distanceM: number,
): { position: LatLng; routeIndex: number } {
  if (route.length === 0) return { position, routeIndex }

  let remaining = distanceM
  let idx = Math.min(routeIndex, route.length - 1)
  let current = position

  while (remaining > 0 && idx < route.length) {
    const target = route[idx]
    const segmentDist = distanceBetween(current, target)

    if (segmentDist <= remaining) {
      remaining -= segmentDist
      current = target
      idx++
      continue
    }

    const ratio = remaining / segmentDist
    current = {
      lat: current.lat + (target.lat - current.lat) * ratio,
      lng: current.lng + (target.lng - current.lng) * ratio,
    }
    remaining = 0
  }

  return { position: current, routeIndex: idx }
}

function distanceBetween(a: LatLng, b: LatLng): number {
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
