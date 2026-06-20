import type { AppActions } from '../app.ts'
import type { UserProfile } from '../../types.ts'
import {
  getSpawnRadiusMeters,
  getZombieCount,
  getZombieSpeedMps,
} from '../../fitness/difficulty.ts'
import { loadProfile, saveProfile } from '../../storage/profile.ts'

const MIN_FITNESS = 1
const MAX_FITNESS = 10

function formatSpeedMph(speedMps: number): string {
  const mph = speedMps / 0.44704
  return mph.toFixed(1)
}

function renderDifficultyPreview(fitnessLevel: number): string {
  const zombieCount = getZombieCount(fitnessLevel)
  const spawnRadius = getSpawnRadiusMeters(fitnessLevel)
  const speedMph = formatSpeedMph(getZombieSpeedMps(fitnessLevel))

  return `
    <div class="difficulty-preview">
      <div class="preview-stat">
        <span class="preview-label">Zombies</span>
        <span class="preview-value">${zombieCount}</span>
      </div>
      <div class="preview-stat">
        <span class="preview-label">Spawn radius</span>
        <span class="preview-value">${spawnRadius} m</span>
      </div>
      <div class="preview-stat">
        <span class="preview-label">Zombie speed</span>
        <span class="preview-value">${speedMph} mph</span>
      </div>
    </div>
  `
}

export function renderSettingsScreen(
  root: HTMLElement,
  profile: UserProfile,
  actions: AppActions,
): void {
  const canDecrease = profile.fitnessLevel > MIN_FITNESS
  const canIncrease = profile.fitnessLevel < MAX_FITNESS

  root.innerHTML = `
    <div class="screen settings-screen">
      <header class="settings-header">
        <button class="btn btn-ghost" id="back-home">&larr; Back</button>
        <h2>Settings</h2>
      </header>

      <section class="card settings-section">
        <h3>Fitness level</h3>
        <p class="settings-description">
          ${
            profile.calibrated
              ? 'Adjust difficulty if calibration was off, or if you want more or less challenge.'
              : 'Complete a calibration run first, or set your starting level manually.'
          }
        </p>

        <div class="fitness-stepper">
          <button
            class="btn btn-secondary stepper-btn"
            id="decrease-fitness"
            ${canDecrease ? '' : 'disabled'}
            aria-label="Decrease fitness level"
          >&minus;</button>
          <div class="fitness-display">
            <span class="fitness-value">${profile.fitnessLevel}</span>
            <span class="fitness-scale">/ ${MAX_FITNESS}</span>
          </div>
          <button
            class="btn btn-secondary stepper-btn"
            id="increase-fitness"
            ${canIncrease ? '' : 'disabled'}
            aria-label="Increase fitness level"
          >+</button>
        </div>

        ${renderDifficultyPreview(profile.fitnessLevel)}
      </section>

      ${
        profile.calibrated
          ? `<section class="card settings-section">
              <h3>Calibration</h3>
              <p class="settings-description">
                Re-run calibration to reset your baseline pace and distance from a fresh run.
              </p>
              <button class="btn btn-secondary" id="recalibrate">Re-run calibration</button>
            </section>`
          : ''
      }
    </div>
  `

  root.querySelector('#back-home')?.addEventListener('click', () => actions.navigate('home'))

  root.querySelector('#decrease-fitness')?.addEventListener('click', () => {
    if (profile.fitnessLevel <= MIN_FITNESS) return
    const updated = { ...profile, fitnessLevel: profile.fitnessLevel - 1 }
    saveProfile(updated)
    renderSettingsScreen(root, loadProfile(), actions)
  })

  root.querySelector('#increase-fitness')?.addEventListener('click', () => {
    if (profile.fitnessLevel >= MAX_FITNESS) return
    const updated = { ...profile, fitnessLevel: profile.fitnessLevel + 1 }
    saveProfile(updated)
    renderSettingsScreen(root, loadProfile(), actions)
  })

  root.querySelector('#recalibrate')?.addEventListener('click', () => {
    const updated = { ...profile, calibrated: false }
    saveProfile(updated)
    renderSettingsScreen(root, loadProfile(), actions)
  })
}
