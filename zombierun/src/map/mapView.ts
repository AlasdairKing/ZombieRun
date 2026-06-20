import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { LatLng, ZombieState } from '../types.ts'

const RUNNER_ICON = L.divIcon({
  className: 'runner-marker',
  html: '<div class="runner-dot"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

const ZOMBIE_ICON = L.divIcon({
  className: 'zombie-marker',
  html: '<div class="zombie-dot">🧟</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

const SAFE_HOUSE_ICON = L.divIcon({
  className: 'safe-house-marker',
  html: `<div class="safe-house-dot" aria-label="Safe house">
    <div class="safe-house-walls"></div>
    <div class="safe-house-roof"></div>
    <div class="safe-house-body"></div>
    <div class="safe-house-door"></div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

export class MapView {
  private map: L.Map
  private runnerMarker: L.Marker | null = null
  private safeHouseMarker: L.Marker | null = null
  private routeLine: L.Polyline | null = null
  private zombieMarkers = new Map<string, L.Marker>()
  private threatCircles = new Map<string, L.Circle>()

  constructor(container: HTMLElement) {
    this.map = L.map(container, {
      zoomControl: false,
      attributionControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map)

    L.control.zoom({ position: 'bottomright' }).addTo(this.map)
  }

  setView(center: LatLng, zoom = 17): void {
    this.map.setView([center.lat, center.lng], zoom)
  }

  setSafeHouse(position: LatLng): void {
    const latLng: L.LatLngExpression = [position.lat, position.lng]

    if (!this.safeHouseMarker) {
      this.safeHouseMarker = L.marker(latLng, {
        icon: SAFE_HOUSE_ICON,
        zIndexOffset: -100,
      }).addTo(this.map)
    } else {
      this.safeHouseMarker.setLatLng(latLng)
    }
  }

  updateRunner(position: LatLng): void {
    const latLng: L.LatLngExpression = [position.lat, position.lng]

    if (!this.runnerMarker) {
      this.runnerMarker = L.marker(latLng, { icon: RUNNER_ICON }).addTo(this.map)
      this.map.setView(latLng, 17)
    } else {
      this.runnerMarker.setLatLng(latLng)
      this.map.panTo(latLng, { animate: true, duration: 0.5 })
    }
  }

  updateRoute(route: LatLng[]): void {
    const latLngs = route.map((p) => [p.lat, p.lng] as L.LatLngExpression)

    if (!this.routeLine) {
      this.routeLine = L.polyline(latLngs, {
        color: '#22c55e',
        weight: 4,
        opacity: 0.85,
      }).addTo(this.map)
    } else {
      this.routeLine.setLatLngs(latLngs)
    }
  }

  updateZombies(zombies: ZombieState[]): void {
    const activeIds = new Set(zombies.map((z) => z.id))

    for (const [id, marker] of this.zombieMarkers) {
      if (!activeIds.has(id)) {
        marker.remove()
        this.zombieMarkers.delete(id)
        this.threatCircles.get(id)?.remove()
        this.threatCircles.delete(id)
      }
    }

    for (const zombie of zombies) {
      const latLng: L.LatLngExpression = [zombie.position.lat, zombie.position.lng]

      let marker = this.zombieMarkers.get(zombie.id)
      if (!marker) {
        marker = L.marker(latLng, { icon: ZOMBIE_ICON }).addTo(this.map)
        this.zombieMarkers.set(zombie.id, marker)

        const circle = L.circle(latLng, {
          radius: 60,
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.12,
          weight: 1,
        }).addTo(this.map)
        this.threatCircles.set(zombie.id, circle)
      } else {
        marker.setLatLng(latLng)
        this.threatCircles.get(zombie.id)?.setLatLng(latLng)
      }
    }
  }

  destroy(): void {
    this.map.remove()
  }
}
