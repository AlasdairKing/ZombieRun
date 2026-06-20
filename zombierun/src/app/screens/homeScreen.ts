import type { AppActions } from '../app.ts'
import type { UserProfile } from '../../types.ts'
import { getZombieCount } from '../../fitness/difficulty.ts'

export function renderHomeScreen(
  root: HTMLElement,
  profile: UserProfile,
  actions: AppActions,
  simulate: boolean,
): void {
  const zombieCount = getZombieCount(profile.fitnessLevel)

  root.innerHTML = `
    <div class="screen home-screen">
      <header class="hero-header">
        <div class="logo-mark">🧟</div>
        <h1>Zombies-Run</h1>
        <p class="tagline">See the threat. Change your route. Outrun the horde.</p>
      </header>

      ${
        !profile.calibrated
          ? `<div class="card calibration-card">
              <h2>Calibration run</h2>
              <p>Your first run establishes baseline pace and distance. Zombies will go easy on you.</p>
            </div>`
          : `<div class="stats-grid">
              <div class="stat">
                <span class="stat-label">Fitness</span>
                <span class="stat-value">${profile.fitnessLevel}/10</span>
              </div>
              <div class="stat">
                <span class="stat-label">Zombies</span>
                <span class="stat-value">${zombieCount}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Sessions</span>
                <span class="stat-value">${profile.totalSessions}</span>
              </div>
            </div>`
      }

      <div class="actions">
        <button class="btn btn-primary" id="start-run">
          ${profile.calibrated ? 'Start run' : 'Start calibration'}
        </button>
        <button class="btn btn-secondary" id="view-history">Session history</button>
        <button class="btn btn-secondary" id="view-settings">Settings</button>
      </div>

      ${
        simulate
          ? '<p class="simulate-badge">Simulation mode — add <code>?simulate</code> to URL for desktop testing</p>'
          : ''
      }

      <footer class="home-footer">
        <p>Live map · GPS tracking · Local session storage</p>
      </footer>
    </div>
  `

  root.querySelector('#start-run')?.addEventListener('click', () => {
    actions.startRun(!profile.calibrated)
  })

  root.querySelector('#view-history')?.addEventListener('click', () => {
    actions.navigate('history')
  })

  root.querySelector('#view-settings')?.addEventListener('click', () => {
    actions.navigate('settings')
  })
}
