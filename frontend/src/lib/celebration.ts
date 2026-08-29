import confetti from "canvas-confetti"

/**
 * Triggers a celebratory particle burst ONLY when the content is verified authentic and SAFE.
 * For unverified, medium, high or critical risk results, celebration is strictly disabled.
 */
export function triggerScanCelebration(riskScore: number, riskLevel?: string): void {
  if (riskLevel === "SAFE" && riskScore <= 10) {
    // Subtle, elegant cyan & emerald celebration burst
    confetti({
      particleCount: 55,
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
