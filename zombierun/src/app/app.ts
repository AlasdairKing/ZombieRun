import type { AppScreen, RunSession, UserProfile } from '../types.ts'
import { loadProfile } from '../storage/profile.ts'
import { renderHistoryScreen } from './screens/historyScreen.ts'
import { renderHomeScreen } from './screens/homeScreen.ts'
import { renderRunScreen } from './screens/runScreen.ts'
import { renderSummaryScreen } from './screens/summaryScreen.ts'

export interface AppActions {
  navigate: (screen: AppScreen, sessionId?: string) => void
  startRun: (calibration: boolean) => void
}

export class App {
  private root: HTMLElement
  private profile: UserProfile
  private currentScreen: AppScreen = 'home'
  private lastSessionId: string | null = null
  private simulate = false

  constructor(root: HTMLElement) {
    this.root = root
    this.profile = loadProfile()
    this.simulate = new URLSearchParams(window.location.search).has('simulate')
    this.render()
  }

  private get actions(): AppActions {
    return {
      navigate: (screen, sessionId) => {
        if (sessionId) this.lastSessionId = sessionId
        this.currentScreen = screen
        this.render()
      },
      startRun: (calibration) => {
        renderRunScreen(this.root, {
          profile: this.profile,
          calibration,
          simulate: this.simulate,
          onComplete: (session) => {
            this.lastSessionId = session.id
            this.profile = loadProfile()
            this.currentScreen = 'summary'
            this.render()
          },
          onCancel: () => {
            this.currentScreen = 'home'
            this.render()
          },
        })
      },
    }
  }

  private render(): void {
    switch (this.currentScreen) {
      case 'home':
        renderHomeScreen(this.root, this.profile, this.actions, this.simulate)
        break
      case 'summary':
        renderSummaryScreen(this.root, this.lastSessionId, this.actions)
        break
      case 'history':
        renderHistoryScreen(this.root, this.actions)
        break
      case 'run':
        this.actions.startRun(!this.profile.calibrated)
        break
    }
  }
}

export type { RunSession }
