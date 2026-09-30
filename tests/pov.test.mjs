// The first-person camera at the laptop (src/scene/pov.ts): the distance from the screen must put
// the whole screen in view at any aspect, with the limiting dimension filling `fill` of the view.
import test from 'node:test'
import assert from 'node:assert/strict'
import { povDistance } from '../src/scene/pov.ts'

const FOV = 23 // the desk camera's vertical fov, degrees
const W = 0.29 // laptop-glass, metres
const H = 0.18
const t = Math.tan((FOV * Math.PI) / 360) // half-height of the view at distance 1

test('landscape: the screen height fills the view and the width still fits', () => {
  const d = povDistance(FOV, 16 / 9, W, H, 0.92)
  assert.ok(Math.abs(2 * d * t * 0.92 - H) < 1e-9, `height should fill 92% of the view, got d=${d}`)
  assert.ok(2 * d * t * (16 / 9) >= W, 'the width must fit too')
})

test('portrait: the screen width fills the view and the height still fits', () => {
  const a = 0.5
  const d = povDistance(FOV, a, W, H, 0.92)
  assert.ok(Math.abs(2 * d * t * a * 0.92 - W) < 1e-9, `width should fill 92% of the view, got d=${d}`)
  assert.ok(2 * d * t >= H, 'the height must fit too')
})

test('the whole screen is in view at every aspect', () => {
  for (const a of [0.4, 0.6, 1, 1.3, 1.6, 2.2, 3]) {
    const d = povDistance(FOV, a, W, H)
    assert.ok(2 * d * t >= H && 2 * d * t * a >= W, `aspect ${a}: the screen spills out at d=${d}`)
  }
})
