import type { AppActions } from '../app.ts'
import { loadSessions } from '../../storage/sessions.ts'
import {
  formatDistance,
  formatDuration,
  formatPace,
} from '../../session/tracker.ts'

export function renderHistoryScreen(root: HTMLElement, actions: AppActions): void {
  const sessions = loadSessions()

  root.innerHTML = `
    <div class="screen history-screen">
      <header class="history-header">
        <button class="btn btn-ghost" id="back-home">&larr; Back</button>
        <h2>Session history</h2>
      </header>

      ${
        sessions.length === 0
          ? '<p class="empty-state">No runs yet. Head out and dodge some zombies!</p>'
          : `<ul class="session-list">
              ${sessions
                .map(
                  (session) => `
                <li class="session-item">
                  <button class="session-link" data-id="${session.id}">
                    <div class="session-row">
                      <strong>${new Date(session.startedAt).toLocaleDateString()}</strong>
                      <span>${session.isCalibration ? 'Calibration' : 'Run'}</span>
                    </div>
                    <div class="session-row muted">
                      <span>${formatDistance(session.distanceMeters)}</span>
                      <span>${formatDuration(session.durationSeconds)}</span>
                      <span>${formatPace(session.averagePaceMinPerKm)}/km</span>
                    </div>
                    <div class="session-row muted">
                      <span>${session.zombiesAvoided} avoided</span>
                      <span>${session.routeChanges} route changes</span>
                    </div>
                  </button>
                </li>
              `,
                )
                .join('')}
            </ul>`
      }
    </div>
  `

  root.querySelector('#back-home')?.addEventListener('click', () => actions.navigate('home'))

  root.querySelectorAll('.session-link').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-id')
      if (id) actions.navigate('summary', id)
    })
  })
}
