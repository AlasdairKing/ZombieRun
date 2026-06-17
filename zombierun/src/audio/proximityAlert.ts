import { PROXIMITY_ALERT_M } from '../zombies/zombieManager.ts'

export class ProximityAlert {
  private audioContext: AudioContext | null = null
  private lastBeepAt = 0

  update(nearestDistanceM: number): void {
    if (nearestDistanceM > PROXIMITY_ALERT_M) return

    const intervalMs = Math.max(200, nearestDistanceM * 25)
    const now = Date.now()
    if (now - this.lastBeepAt < intervalMs) return

    this.lastBeepAt = now
    this.beep(nearestDistanceM)
  }

  private beep(distanceM: number): void {
    try {
      if (!this.audioContext) {
        this.audioContext = new AudioContext()
      }

      const ctx = this.audioContext
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'square'
      osc.frequency.value = distanceM < 30 ? 880 : 440
      gain.gain.value = 0.08

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.12)
    } catch {
      // Audio may be blocked until user gesture; map remains primary interface.
    }
  }

  dispose(): void {
    void this.audioContext?.close()
    this.audioContext = null
  }
}
