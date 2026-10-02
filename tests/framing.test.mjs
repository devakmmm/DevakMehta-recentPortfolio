// Where each object lands in the frame at its camera stop. The timeline text sits on a frosted panel
// over the right ~47% of the screen (styles.css .glass-rail, min(680px, 52vw)), which blurs whatever
// is behind it; an object framed under it reads as blurred. Reads the camera keyframe and the object's
// transform straight from me.glb and projects the object's corners with the glb camera's own fov.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import * as THREE from 'three'

const GLB = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'models', 'me.glb')
const FPS = 24
const ASPECT = 1440 / 900
const PANEL_LEFT = (1440 - 680) / 1440 // where the frosted panel starts at 1440 wide

function readGlb(file) {
  const buf = readFileSync(file)
  const jsonLen = buf.readUInt32LE(12)
  const json = JSON.parse(buf.subarray(20, 20 + jsonLen).toString('utf8'))
  const binStart = 20 + jsonLen + 8
  const bin = buf.subarray(binStart, binStart + buf.readUInt32LE(20 + jsonLen))
  const SIZE = { SCALAR: 1, VEC3: 3, VEC4: 4 }
  const accessor = (i) => {
    const a = json.accessors[i]
    const v = json.bufferViews[a.bufferView]
    const off = (v.byteOffset || 0) + (a.byteOffset || 0)
    const n = a.count * SIZE[a.type]
    return new Float32Array(bin.buffer.slice(bin.byteOffset + off, bin.byteOffset + off + n * 4))
  }
  return { json, accessor }
}

// the camera's world pose at a frame: CameraAction's translation and rotation keys at that time
function cameraAt(g, frame) {
  const clip = g.json.animations.find((a) => a.name === 'CameraAction')
  const camNode = g.json.nodes.findIndex((n) => n.camera !== undefined)
  const pose = {}
  for (const ch of clip.channels.filter((c) => c.target.node === camNode)) {
    const s = clip.samplers[ch.sampler]
    const times = g.accessor(s.input)
    const k = times.findIndex((t) => Math.abs(t * FPS - frame) < 1e-3)
    assert.ok(k >= 0, `no ${ch.target.path} key at frame ${frame}`)
    const w = ch.target.path === 'rotation' ? 4 : 3
    pose[ch.target.path] = Array.from(g.accessor(s.output).slice(k * w, k * w + w))
  }
  const yfov = g.json.cameras[g.json.nodes[camNode].camera].perspective.yfov
  const cam = new THREE.PerspectiveCamera(THREE.MathUtils.radToDeg(yfov), ASPECT, 0.01, 100)
  cam.position.fromArray(pose.translation)
  cam.quaternion.fromArray(pose.rotation)
  cam.updateMatrixWorld()
  return cam
}

// where the laptop's box (base plus open screen) lands, as fractions of the frame width and height
function laptopOnScreen(g, cam) {
  const node = g.json.nodes.find((n) => n.name === 'laptop')
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3().fromArray(node.translation || [0, 0, 0]),
    new THREE.Quaternion().fromArray(node.rotation || [0, 0, 0, 1]),
    new THREE.Vector3().fromArray(node.scale || [1, 1, 1])
  )
  const xs = [], ys = []
  for (const x of [-0.155, 0.155]) for (const y of [0, 0.21]) for (const z of [-0.17, 0.11]) {
    const p = new THREE.Vector3(x, y, z).applyMatrix4(m).project(cam)
    xs.push((p.x + 1) / 2)
    ys.push((1 - p.y) / 2)
  }
  return { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) }
}

test('at its stop the laptop sits left of the frosted text panel, whole and in frame', () => {
  const g = readGlb(GLB)
  const box = laptopOnScreen(g, cameraAt(g, 100)) // stop 2 = frame 100
  assert.ok(box.right <= PANEL_LEFT + 0.03, `laptop runs under the text panel: right edge at ${box.right.toFixed(2)} of the width, panel starts at ${PANEL_LEFT.toFixed(2)}`)
  assert.ok(box.left >= 0.02 && box.top >= 0.02 && box.bottom <= 0.98, `laptop is cut off: ${JSON.stringify(box)}`)
})
