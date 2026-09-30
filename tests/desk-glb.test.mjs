// The desk model must satisfy the scene's naming contract (scene/Scene.tsx reads the glb by name):
// a camera + an animation clip "CameraAction" (24 fps), empties focus-0, focus-1..5, focus-works,
// and a mesh whose name contains "eye". Parsed straight from the GLB container, no loader needed.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const GLB = path.join(here, '..', 'public', 'models', 'me.glb')
const FPS = 24
const FRAMES_PER_NODE = 50
const NODES = 5

function readGlbJson(file) {
  const buf = readFileSync(file)
  assert.equal(buf.readUInt32LE(0), 0x46546c67, 'GLB magic')
  const jsonLen = buf.readUInt32LE(12)
  assert.equal(buf.readUInt32LE(16), 0x4e4f534a, 'first chunk is JSON')
  return JSON.parse(buf.subarray(20, 20 + jsonLen).toString('utf8'))
}

test('me.glb exists (built by scripts/build-desk-glb.mjs)', () => {
  assert.ok(existsSync(GLB), `${GLB} missing`)
})

test('required nodes are present by name', () => {
  const g = readGlbJson(GLB)
  const names = new Set((g.nodes || []).map((n) => n.name))
  for (const n of ['focus-0', 'focus-1', 'focus-2', 'focus-3', 'focus-4', 'focus-5', 'focus-works']) {
    assert.ok(names.has(n), `missing empty ${n}`)
  }
  assert.ok([...names].some((n) => /eye/i.test(n)), 'no mesh named *eye* for cursor-follow')
  assert.ok((g.cameras || []).length >= 1, 'no camera')
  assert.ok((g.nodes || []).some((n) => n.camera !== undefined), 'no node carries the camera')
})

test('CameraAction clip exists and spans hero → 5 stops → works tail at 24 fps', () => {
  const g = readGlbJson(GLB)
  const clip = (g.animations || []).find((a) => a.name === 'CameraAction')
  assert.ok(clip, 'no animation named CameraAction')
  const inputIdx = clip.samplers[0].input
  const maxT = g.accessors[inputIdx].max[0]
  const frames = Math.round(maxT * FPS)
  assert.ok(frames > NODES * FRAMES_PER_NODE, `clip too short: ${frames} frames, need > ${NODES * FRAMES_PER_NODE}`)
  const camNode = g.nodes.findIndex((n) => n.camera !== undefined)
  assert.ok(clip.channels.some((c) => c.target.node === camNode), 'clip does not animate the camera node')
})

// The desk tells the story. Every object that a timeline stop points at has its real parts,
// the puck carries one sticker per build, the laptop screen shows a snake, and the hologram inside
// the pyramid is the "eye" that follows the cursor.
test('the desk has its story parts', () => {
  const g = readGlbJson(GLB)
  const names = (g.nodes || []).map((n) => n.name || '')
  const has = (n) => names.includes(n)
  for (const n of ['puck-shell', 'puck-lid', 'puck-ring', 'puck-button', 'puck-grille', 'puck-cable', 'devkit-board']) {
    assert.ok(has(n), `puck detail missing: ${n}`)
  }
  assert.ok(names.filter((n) => n.startsWith('puck-led-')).length === 16, '16 NeoPixels expected on the ring')
  assert.ok(names.filter((n) => n.startsWith('sticker-')).length >= 5, 'at least five stickers (one per build)')
  for (const n of ['laptop-base', 'laptop-screen', 'laptop-trackpad', 'snake-food']) assert.ok(has(n), `laptop detail missing: ${n}`)
  assert.ok(names.filter((n) => n.startsWith('laptop-key-')).length >= 60, 'a keyboard needs keys')
  assert.ok(names.filter((n) => n.startsWith('snake-seg-')).length >= 6, 'a snake on the screen')
  for (const n of ['pyramid-glass', 'pyramid-base', 'holo-figure']) assert.ok(has(n), `pyramid detail missing: ${n}`)
  for (const n of ['notebook-cover', 'notebook-pages', 'pen', 'hooks-card', 'mug']) assert.ok(has(n), `desk detail missing: ${n}`)
})

// The cat: black and white, sitting on the desk corner, eyes that follow the cursor (the only nodes
// whose names contain "eye", so the scene's eye-follow drives them and nothing else).
test('a black and white cat sits on the desk, and its eyes are the eyes', () => {
  const g = readGlbJson(GLB)
  const names = (g.nodes || []).map((n) => n.name || '')
  for (const n of ['cat', 'cat-body', 'cat-chest', 'cat-head', 'cat-muzzle', 'cat-ear-l', 'cat-ear-r', 'cat-eye-l', 'cat-eye-r', 'cat-nose', 'cat-tail', 'cat-collar', 'cat-tag']) {
    assert.ok(names.includes(n), `cat part missing: ${n}`)
  }
  assert.ok(names.filter((n) => n.startsWith('cat-paw-')).length >= 2, 'front paws')
  assert.ok(names.filter((n) => n.startsWith('cat-whisker-')).length >= 4, 'whiskers')
  const eyes = names.filter((n) => /eye/i.test(n))
  assert.deepEqual(eyes.sort(), ['cat-eye-l', 'cat-eye-r'], `only the cat's eyes may match /eye/: ${eyes}`)
})

// Personal touches that need no file from Devak: initials on the mug, and a photo frame that stays
// hidden until public/images/photo.jpg exists (the scene shows it at runtime).
test('the mug carries initials and the desk has a photo frame', () => {
  const g = readGlbJson(GLB)
  const names = (g.nodes || []).map((n) => n.name || '')
  for (const n of ['mug-initials', 'photo-frame', 'frame-photo']) assert.ok(names.includes(n), `missing: ${n}`)
})
