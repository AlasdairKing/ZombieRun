import type { AppActions } from '../app.ts'
import { getSession } from '../../storage/sessions.ts'
import {
  formatDistance,
  formatDuration,
  formatPace,
} from '../../session/tracker.ts'

export function renderSummaryScreen(
  root: HTMLElement,
  sessionId: string | null,
  actions: AppActions,
): void {
  const session = sessionId ? getSession(sessionId) : undefined

  if (!session) {
    root.innerHTML = `
      <div class="screen summary-screen">
        <h2>Session not found</h2>
        <button class="btn btn-primary" id="back-home">Back home</button>
      </div>
    `
    root.querySelector('#back-home')?.addEventListener('click', () => actions.navigate('home'))
    return
  }

  root.innerHTML = `
    <div class="screen summary-screen">
      <header>
        <h2>${session.isCalibration ? 'Calibration complete' : 'Run complete'}</h2>
        <p class="summary-date">${new Date(session.endedAt).toLocaleString()}</p>
      </header>

      <div class="summary-grid">
        <div class="summary-stat">
          <span class="summary-label">Distance</span>
          <span class="summary-value">${formatDistance(session.distanceMeters)}</span>
        </div>
        <div class="summary-stat">
          <span class="summary-label">Duration</span>
          <span class="summary-value">${formatDuration(session.durationSeconds)}</span>
        </div>
        <div class="summary-stat">
          <span class="summary-label">Pace</span>
          <span class="summary-value">${formatPace(session.averagePaceMinPerKm)} /km</span>
        </div>
        <div class="summary-stat">
          <span class="summary-label">Zombies faced</span>
          <span class="summary-value">${session.zombieCount}</span>
        </div>
        <div class="summary-stat highlight">
          <span class="summary-label">Zombies avoided</span>
          <span class="summary-value">${session.zombiesAvoided}</span>
        </div>
        <div class="summary-stat highlight">
          <span class="summary-label">Route changes</span>
          <span class="summary-value">${session.routeChanges}</span>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-primary" id="back-home">Back home</button>
        <button class="btn btn-secondary" id="view-history">View history</button>
      </div>
    </div>
  `

  root.querySelector('#back-home')?.addEventListener('click', () => actions.navigate('home'))
  root.querySelector('#view-history')?.addEventListener('click', () => actions.navigate('history'))
}
