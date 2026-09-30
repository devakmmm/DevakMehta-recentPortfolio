// First person at the laptop: how far in front of the screen the camera sits so the screen fills the
// view. Pure math, no three.js, so it runs under node:test (tests/pov.test.mjs).

// fovDeg: the camera's vertical field of view; aspect: view width / height; screenW/H in world
// units; fill: the share of the limiting dimension the screen should take (a little margin around).
export function povDistance(fovDeg: number, aspect: number, screenW: number, screenH: number, fill = 0.92): number {
  const halfView = Math.tan((fovDeg * Math.PI) / 360) // half the view height at distance 1
  const byHeight = screenH / 2 / halfView
  const byWidth = screenW / 2 / (halfView * aspect)
  return Math.max(byHeight, byWidth) / fill
}
