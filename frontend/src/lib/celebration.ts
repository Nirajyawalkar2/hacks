import confetti from "canvas-confetti"

/**
 * Triggers a celebratory particle burst for LOW/MEDIUM risk results.
 * For HIGH/CRITICAL risk results, confetti is intentionally avoided.
 */
export function triggerScanCelebration(riskScore: number): void {
  if (riskScore <= 60) {
    // Subtle, elegant cyan & emerald celebration burst
    confetti({
      particleCount: 50,
      angle: 90,
      spread: 65,
      origin: { y: 0.62 },
      colors: ["#06b6d4", "#10b981", "#38bdf8", "#34d399", "#ffffff"],
      ticks: 150,
      gravity: 1.2,
      scalar: 0.9,
      disableForReducedMotion: true,
      zIndex: 999
    })
  }
}
