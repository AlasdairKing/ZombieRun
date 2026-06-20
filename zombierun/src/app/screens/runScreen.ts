import { ProximityAlert } from '../../audio/proximityAlert.ts'
import { getZombieCount, updateProfileAfterSession } from '../../fitness/difficulty.ts'
import { GeolocationTracker } from '../../geo/geolocation.ts'
import { MapView } from '../../map/mapView.ts'
import {
  formatDistance,
  formatDuration,
  formatPace,
  SessionTracker,
} from '../../session/tracker.ts'
import { loadProfile, saveProfile } from '../../storage/profile.ts'
import { saveSession } from '../../storage/sessions.ts'
import type { RunSession, UserProfile } from '../../types.ts'
import {
  nearestZombieDistance,
  PROXIMITY_ALERT_M,
  ZombieManager,
} from '../../zombies/zombieManager.ts'

interface RunScreenOptions {
  profile: UserProfile
  calibration: boolean
  simulate: boolean
  onComplete: (session: RunSession) => void
  onCancel: () => void
}

export function renderRunScreen(root: HTMLElement, options: RunScreenOptions): void {
  const zombieCount = options.calibration ? 1 : getZombieCount(options.profile.fitnessLevel)

  root.innerHTML = `
    <div class="screen run-screen">
      <div id="map" class="map-container"></div>
      <div class="run-hud">
        <div class="hud-row">
          <div class="hud-stat">
            <span class="hud-label">Distance</span>
            <span class="hud-value" id="hud-distance">0 m</span>
          </div>
          <div class="hud-stat">
            <span class="hud-label">Time</span>
            <span class="hud-value" id="hud-time">0:00</span>
          </div>
          <div class="hud-stat">
            <span class="hud-label">Pace</span>
            <span class="hud-value" id="hud-pace">--:--</span>
          </div>
        </div>
        <div class="hud-row">
          <div class="hud-stat">
            <span class="hud-label">Zombies</span>
            <span class="hud-value" id="hud-zombies">${zombieCount}</span>
          </div>
          <div class="hud-stat">
            <span class="hud-label">Nearest</span>
            <span class="hud-value" id="hud-nearest">--</span>
          </div>
          <div class="hud-stat alert-stat" id="hud-alert" hidden>
            <span class="hud-label">⚠️ Close!</span>
          </div>
        </div>
      </div>
      <div class="run-controls">
        <button class="btn btn-danger" id="end-run">End run</button>
      </div>
      <div class="run-status" id="run-status">Acquiring GPS…</div>
    </div>
  `

  const statusEl = root.querySelector('#run-status') as HTMLElement
  const alertEl = root.querySelector('#hud-alert') as HTMLElement
  const mapContainer = root.querySelector('#map') as HTMLElement

  const map = new MapView(mapContainer)
  const geo = new GeolocationTracker()
  const zombies = new ZombieManager()
  zombies.setFitnessLevel(options.profile.fitnessLevel)

  const tracker = new SessionTracker(options.calibration, zombieCount)
  const proximity = new ProximityAlert()

  let started = false
  let finished = false
  let lastTick = performance.now()
  let animationFrame = 0
  let hudInterval: ReturnType<typeof setInterval> | null = null
  let statusDismissTimer: ReturnType<typeof setTimeout> | null = null

  const dismissStatusAfterDelay = () => {
    if (statusDismissTimer) clearTimeout(statusDismissTimer)
    statusDismissTimer = setTimeout(() => {
      statusDismissTimer = null
      statusEl.hidden = true
    }, 5000)
  }

  const finishRun = () => {
    if (finished) return
    finished = true

    cancelAnimationFrame(animationFrame)
    if (hudInterval) clearInterval(hudInterval)
    if (statusDismissTimer) clearTimeout(statusDismissTimer)
    geo.stop()
    proximity.dispose()
    map.destroy()

    const session = tracker.finish()
    saveSession(session)
    saveProfile(updateProfileAfterSession(loadProfile(), session))
    options.onComplete(session)
  }

  const tick = (now: number) => {
    if (finished) return

    const delta = Math.min(1, (now - lastTick) / 1000)
    lastTick = now

    const runner = tracker.getLastPosition()
    if (runner) {
      zombies.update(runner, delta)
      map.updateZombies(zombies.getZombies())
      tracker.trackZombieProximity(runner, zombies.getZombies())

      const nearest = nearestZombieDistance(runner, zombies.getZombies())
      proximity.update(nearest)

      const nearestEl = root.querySelector('#hud-nearest')!
      nearestEl.textContent = Number.isFinite(nearest) ? `${Math.round(nearest)} m` : '--'
      alertEl.hidden = nearest > PROXIMITY_ALERT_M

      if (tracker.wasCaught()) {
        if (statusDismissTimer) clearTimeout(statusDismissTimer)
        statusEl.hidden = false
        statusEl.textContent = 'Caught! Ending run…'
        finishRun()
        return
      }
    }

    animationFrame = requestAnimationFrame(tick)
  }

  geo.start(
    async (position) => {
      if (finished) return

      tracker.addPosition(position)
      map.updateRunner(position.coords)
      map.updateRoute(tracker.getRoute())

      if (!started) {
        started = true
        statusEl.hidden = false
        statusEl.textContent = options.calibration
          ? 'Calibration run — keep a steady pace'
          : 'Run! Zombies are closing in…'
        dismissStatusAfterDelay()
        await zombies.spawnNear(position.coords, zombieCount)
        if (finished) return

        map.updateZombies(zombies.getZombies())
        animationFrame = requestAnimationFrame(tick)
      }
    },
    (message) => {
      if (statusDismissTimer) clearTimeout(statusDismissTimer)
      statusEl.hidden = false
      statusEl.textContent = `GPS error: ${message}`
    },
    options.simulate,
  )

  hudInterval = setInterval(() => {
    root.querySelector('#hud-distance')!.textContent = formatDistance(
      tracker.getDistanceMeters(),
    )
    root.querySelector('#hud-time')!.textContent = formatDuration(tracker.getElapsedSeconds())
    root.querySelector('#hud-pace')!.textContent = formatPace(tracker.getAveragePaceMinPerKm())
  }, 1000)

  root.querySelector('#end-run')?.addEventListener('click', finishRun)
}
