import type { LatLng } from '../types.ts'

export interface GeoPosition {
  coords: LatLng
  accuracy: number
  timestamp: number
}

export type GeoUpdateCallback = (position: GeoPosition) => void
export type GeoErrorCallback = (message: string) => void

export class GeolocationTracker {
  private watchId: number | null = null
  private simulateInterval: ReturnType<typeof setInterval> | null = null
  private simulatedPosition: LatLng | null = null
  private simulatedBearing = 0

  start(
    onUpdate: GeoUpdateCallback,
    onError: GeoErrorCallback,
    simulate = false,
  ): void {
    this.stop()

    if (simulate) {
      this.startSimulation(onUpdate)
      return
    }

    if (!navigator.geolocation) {
      onError('Geolocation is not supported on this device.')
      return
    }

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        onUpdate({
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        })
      },
      (err) => onError(err.message),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 },
    )
  }

  stop(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
    if (this.simulateInterval) {
      clearInterval(this.simulateInterval)
      this.simulateInterval = null
    }
  }

  private startSimulation(onUpdate: GeoUpdateCallback): void {
    this.simulatedPosition = { lat: 51.5074, lng: -0.1278 }
    this.simulatedBearing = 45

    onUpdate({
      coords: this.simulatedPosition,
      accuracy: 5,
      timestamp: Date.now(),
    })

    this.simulateInterval = setInterval(() => {
      if (!this.simulatedPosition) return

      this.simulatedBearing = (this.simulatedBearing + (Math.random() - 0.5) * 30) % 360
      const speedMps = 2.5 + Math.random() * 0.5
      const distance = speedMps * 2

      const toRad = (deg: number) => (deg * Math.PI) / 180
      const angular = distance / 6371000
      const bearing = toRad(this.simulatedBearing)
      const lat1 = toRad(this.simulatedPosition.lat)
      const lng1 = toRad(this.simulatedPosition.lng)

      const lat2 = Math.asin(
        Math.sin(lat1) * Math.cos(angular) +
          Math.cos(lat1) * Math.sin(angular) * Math.cos(bearing),
      )
      const lng2 =
        lng1 +
        Math.atan2(
          Math.sin(bearing) * Math.sin(angular) * Math.cos(lat1),
          Math.cos(angular) - Math.sin(lat1) * Math.sin(lat2),
        )

      this.simulatedPosition = {
        lat: (lat2 * 180) / Math.PI,
        lng: (lng2 * 180) / Math.PI,
      }

      onUpdate({
        coords: this.simulatedPosition,
        accuracy: 5,
        timestamp: Date.now(),
      })
    }, 2000)
  }
}
