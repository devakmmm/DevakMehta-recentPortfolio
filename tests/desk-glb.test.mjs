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
