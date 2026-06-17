import type { RunSession } from '../types.ts'

const STORAGE_KEY = 'zombierun-sessions'

export function loadSessions(): RunSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as RunSession[]
  } catch {
    return []
  }
}

export function saveSession(session: RunSession): void {
  const sessions = loadSessions()
  sessions.unshift(session)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 50)))
}

export function getSession(id: string): RunSession | undefined {
  return loadSessions().find((s) => s.id === id)
}
