// Builds public/models/me.glb: Devak's desk with the puck and four other objects, plus the camera
// path and focus anchors that src/scene/Scene.tsx reads BY NAME:
//   camera + animation clip "CameraAction" (24 fps): frame 0 hero, frame 50·k stop k, tail = works
//   empties focus-0 (hero), focus-1..5 (one per build), focus-works; a mesh named "eye-lid".
// Units are metres (glTF). Puck dimensions come from cerberus-desk/bom.md (box 80×110×45 mm,
// NeoPixel ring 44.5 mm OD, 12 mm button). The other objects are simple stand-ins for now.
// Run: node scripts/build-desk-glb.mjs   Test: node --test tests/desk-glb.test.mjs
import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

// GLTFExporter reads Blobs through the browser FileReader; Node has Blob but no FileReader.
class NodeFileReader {
  constructor() {
    this.result = null
    this.onloadend = null
    this.onload = null
  }
  _done() {
    if (this.onload) this.onload()
    if (this.onloadend) this.onloadend()
  }
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((b) => {
      this.result = b
      this._done()
    })
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((b) => {
      const type = blob.type || 'application/octet-stream'
      this.result = `data:${type};base64,${Buffer.from(b).toString('base64')}`
      this._done()
    })
  }
}
if (typeof globalThis.FileReader === 'undefined') globalThis.FileReader = NodeFileReader

const FPS = 24
const FRAMES_PER_NODE = 50
const WORKS_TAIL = 100
const NODES = 5

const mm = (v) => v / 1000

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.05, ...opts })
}
function box(w, h, d, material, name) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
  m.name = name
  return m
}
function empty(name, x, y, z) {
  const o = new THREE.Object3D()
  o.name = name
  o.position.set(x, y, z)
  return o
}

const scene = new THREE.Scene()
scene.name = 'desk'

// ---- desk ---------------------------------------------------------------------------------
const DESK_W = 1.2, DESK_T = 0.03, DESK_D = 0.7
const desk = box(DESK_W, DESK_T, DESK_D, mat('#8a6d4b', { roughness: 0.8 }), 'desk')
desk.position.set(0, -DESK_T / 2, 0)
scene.add(desk)
const TOP = 0 // desk top plane

// ---- the puck: Adafruit box 903, 80 × 110 × 45 mm, clear lid, ring under the lid, button ----
const PW = mm(80), PH = mm(45), PD = mm(110)
const puck = new THREE.Group()
puck.name = 'puck'
puck.position.set(-0.34, TOP, 0.06)
const shell = box(PW, PH - mm(3), PD, mat('#6f7378', { roughness: 0.7 }), 'puck-shell')
shell.position.y = (PH - mm(3)) / 2
puck.add(shell)
const lid = box(PW, mm(3), PD, mat('#dfe7ee', { roughness: 0.15, transparent: true, opacity: 0.35 }), 'eye-lid')
lid.position.y = PH - mm(1.5)
puck.add(lid)
const ring = new THREE.Mesh(new THREE.TorusGeometry(mm(44.5) / 2 - mm(2.5), mm(2.5), 12, 48), mat('#7fd0ff', { emissive: '#3aa8ff', emissiveIntensity: 1.2, roughness: 0.3 }))
ring.name = 'puck-ring'
ring.rotation.x = Math.PI / 2
ring.position.set(0, PH - mm(8), -mm(15))
puck.add(ring)
const button = new THREE.Mesh(new THREE.CylinderGeometry(mm(5.5), mm(5.5), mm(6), 24), mat('#d23b3b', { roughness: 0.4 }))
button.name = 'puck-button'
button.position.set(0, PH + mm(2), mm(38))
puck.add(button)
scene.add(puck)

// ---- laptop ------------------------------------------------------------------------------
const laptop = new THREE.Group()
laptop.name = 'laptop'
laptop.position.set(0.12, TOP, -0.12)
const base = box(0.30, 0.012, 0.21, mat('#3a3d42', { roughness: 0.5, metalness: 0.3 }), 'laptop-base')
base.position.y = 0.006
laptop.add(base)
const screen = box(0.30, 0.20, 0.006, mat('#2a2d31', { roughness: 0.5, metalness: 0.3 }), 'laptop-screen')
screen.position.set(0, 0.10 + 0.012, -0.105)
screen.rotation.x = -0.26
laptop.add(screen)
const glass = box(0.28, 0.18, 0.001, mat('#0b1b2a', { emissive: '#12324a', emissiveIntensity: 0.6, roughness: 0.2 }), 'laptop-glass')
glass.position.set(0, 0.10 + 0.012, -0.101)
glass.rotation.x = -0.26
laptop.add(glass)
scene.add(laptop)

// ---- pyramid (the holo-table's pepper's ghost) ----------------------------------------------
const pyramid = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.06, 4), mat('#cfe6f5', { roughness: 0.1, transparent: true, opacity: 0.4 }))
pyramid.name = 'pyramid'
pyramid.rotation.y = Math.PI / 4
pyramid.position.set(0.44, TOP + 0.03, 0.10)
scene.add(pyramid)

// ---- notebook ---------------------------------------------------------------------------
const notebook = box(0.15, 0.012, 0.21, mat('#efe6cf', { roughness: 0.9 }), 'notebook')
notebook.position.set(-0.06, TOP + 0.006, 0.24)
notebook.rotation.y = 0.12
scene.add(notebook)

// ---- the hooks card (make-your-claude) ---------------------------------------------------
const card = box(0.09, 0.004, 0.055, mat('#f4f1ea', { roughness: 0.85 }), 'hooks-card')
card.position.set(0.33, TOP + 0.002, 0.27)
card.rotation.y = -0.2
scene.add(card)

// ---- focus anchors (empties), read by name ----------------------------------------------
const stops = [
  ['focus-1', puck.position.x, TOP + PH / 2, puck.position.z],
  ['focus-2', laptop.position.x, TOP + 0.11, laptop.position.z - 0.08],
  ['focus-3', pyramid.position.x, TOP + 0.03, pyramid.position.z],
  ['focus-4', notebook.position.x, TOP + 0.01, notebook.position.z],
  ['focus-5', card.position.x, TOP + 0.005, card.position.z],
]
scene.add(empty('focus-0', 0, TOP + 0.08, 0.02))
for (const [n, x, y, z] of stops) scene.add(empty(n, x, y, z))
scene.add(empty('focus-works', 0, TOP + 0.05, 0))

// ---- camera + CameraAction ---------------------------------------------------------------
const camera = new THREE.PerspectiveCamera(23, 1, 0.05, 50)
camera.name = 'Camera'
scene.add(camera)

// [frame, position, lookAt]
const poses = [
  [0, [0.35, 0.95, 3.1], [0, 0.05, 0.0]],
  [50, [puck.position.x + 0.22, TOP + 0.26, puck.position.z + 0.5], [puck.position.x, TOP + PH / 2, puck.position.z]],
  [100, [laptop.position.x + 0.18, TOP + 0.34, laptop.position.z + 0.72], [laptop.position.x, TOP + 0.11, laptop.position.z - 0.08]],
  [150, [pyramid.position.x + 0.22, TOP + 0.2, pyramid.position.z + 0.48], [pyramid.position.x, TOP + 0.03, pyramid.position.z]],
  [200, [notebook.position.x + 0.12, TOP + 0.42, notebook.position.z + 0.55], [notebook.position.x, TOP + 0.01, notebook.position.z]],
  [250, [card.position.x + 0.12, TOP + 0.24, card.position.z + 0.42], [card.position.x, TOP + 0.005, card.position.z]],
  [250 + WORKS_TAIL, [0.0, 1.5, 2.3], [0, 0.05, 0]],
]
const times = [], pos = [], quat = []
for (const [frame, p, look] of poses) {
  camera.position.set(...p)
  camera.lookAt(new THREE.Vector3(...look))
  camera.updateMatrixWorld()
  times.push(frame / FPS)
  pos.push(...p)
  quat.push(camera.quaternion.x, camera.quaternion.y, camera.quaternion.z, camera.quaternion.w)
}
// leave the camera at the hero pose as its rest transform
camera.position.set(...poses[0][1])
camera.lookAt(new THREE.Vector3(...poses[0][2]))

const clip = new THREE.AnimationClip('CameraAction', -1, [
  new THREE.VectorKeyframeTrack('Camera.position', times, pos),
  new THREE.QuaternionKeyframeTrack('Camera.quaternion', times, quat),
])

// ---- export ------------------------------------------------------------------------------
const here = path.dirname(fileURLToPath(import.meta.url))
const out = path.join(here, '..', 'public', 'models', 'me.glb')
mkdirSync(path.dirname(out), { recursive: true })

const exporter = new GLTFExporter()
exporter.parse(
  scene,
  (result) => {
    writeFileSync(out, Buffer.from(result))
    const frames = (250 + WORKS_TAIL)
    console.log(`wrote ${out} (${Buffer.byteLength(Buffer.from(result))} bytes); CameraAction ${frames} frames @ ${FPS} fps, ${NODES} stops, ${FRAMES_PER_NODE} frames apart`)
  },
  (err) => {
    console.error('export failed:', err)
    process.exit(1)
  },
  { binary: true, animations: [clip], onlyVisible: true, trs: true }
)
