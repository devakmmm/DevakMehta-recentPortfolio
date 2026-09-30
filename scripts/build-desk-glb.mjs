// Builds public/models/me.glb: Devak's desk, with the camera path and focus anchors that
// src/scene/Scene.tsx reads BY NAME:
//   camera + animation clip "CameraAction" (24 fps): frame 0 hero, frame 50·k stop k, tail = works
//   empties focus-0 (hero), focus-1..5 (one per build), focus-works; the cat's eyes (cat-eye-l/r),
//   the only nodes named *eye*, which the scene turns toward the cursor.
// Units are metres (glTF). The puck is the real enclosure (80 × 110 × 45 mm box, clear lid,
// 44.5 mm ring with 16 pixels, 12 mm button, speaker grille on a 5 mm grid, mic pinhole).
// Run: node scripts/build-desk-glb.mjs   Test: node --test tests/desk-glb.test.mjs
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'

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

// ---- materials --------------------------------------------------------------------------
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.65, metalness: 0.05, ...o })
const glass = (color = '#eaf3f8') =>
  new THREE.MeshPhysicalMaterial({ color, roughness: 0.08, metalness: 0, transmission: 0.9, thickness: 0.004, ior: 1.5, transparent: true, opacity: 1 })
const glow = (color, intensity = 1.2) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: 0.35 })

const M = {
  wood: std('#9a7550', { roughness: 0.78 }),
  abs: std('#767b81', { roughness: 0.6 }),
  pcbRing: std('#1d2b22', { roughness: 0.55 }),
  led: glow('#7fd0ff', 2.6),
  red: std('#cf3c3c', { roughness: 0.4 }),
  black: std('#17191c', { roughness: 0.5 }),
  cable: std('#202225', { roughness: 0.7 }),
  pcb: std('#1f6b3a', { roughness: 0.5 }),
  chip: std('#101214', { roughness: 0.35, metalness: 0.2 }),
  silver: std('#b9bcc2', { roughness: 0.35, metalness: 0.6 }),
  key: std('#2b2e33', { roughness: 0.55 }),
  screenGlass: new THREE.MeshStandardMaterial({ color: '#0d1b2a', emissive: '#12324c', emissiveIntensity: 0.45, roughness: 0.2 }),
  snake: glow('#5fbf6a', 0.9),
  food: glow('#e0543f', 0.9),
  monitor: std('#151a1f', { roughness: 0.45 }),
  monitorFace: new THREE.MeshStandardMaterial({ color: '#08141c', emissive: '#0d2a38', emissiveIntensity: 0.5, roughness: 0.3 }),
  holo: new THREE.MeshStandardMaterial({ color: '#8fe8f0', emissive: '#59d6e6', emissiveIntensity: 1.1, transparent: true, opacity: 0.7, roughness: 0.3 }),
  cover: std('#c8a978', { roughness: 0.85 }),
  pages: std('#ece4d2', { roughness: 0.9 }),
  band: std('#3a3530', { roughness: 0.8 }),
  pen: std('#23395b', { roughness: 0.4, metalness: 0.2 }),
  card: std('#efe9dc', { roughness: 0.85 }),
  mug: std('#3d6b8f', { roughness: 0.45 }),
  coffee: std('#3b2214', { roughness: 0.4 }),
  stickerPaper: std('#f7f4ee', { roughness: 0.6 }),
  fur: std('#141416', { roughness: 0.95 }),
  furWhite: std('#f2efe8', { roughness: 0.95 }),
  catEye: std('#c9d36a', { roughness: 0.25, emissive: '#3b4a10', emissiveIntensity: 0.25 }),
  pupil: std('#0a0a0a', { roughness: 0.3 }),
  pink: std('#e2a0a8', { roughness: 0.7 }),
  collar: std('#c8443f', { roughness: 0.5 }),
  brass: std('#d1a545', { roughness: 0.35, metalness: 0.7 }),
  whisker: std('#e8e4dc', { roughness: 0.6 }),
  frameWood: std('#4a3626', { roughness: 0.7 }),
  photoBlank: std('#d8d3c8', { roughness: 0.8 }),
  initials: std('#f4f1ea', { roughness: 0.5 }),
}

// ---- helpers ----------------------------------------------------------------------------
function mesh(geo, material, name, pos = [0, 0, 0], rot = [0, 0, 0]) {
  const m = new THREE.Mesh(geo, material)
  m.name = name
  m.position.set(...pos)
  m.rotation.set(...rot)
  return m
}
const box = (w, h, d, material, name, pos, rot) => mesh(new THREE.BoxGeometry(w, h, d), material, name, pos, rot)
const cyl = (r, h, material, name, pos, rot, n = 32) => mesh(new THREE.CylinderGeometry(r, r, h, n), material, name, pos, rot)
function group(name, pos = [0, 0, 0], rotY = 0) {
  const g = new THREE.Group()
  g.name = name
  g.position.set(...pos)
  g.rotation.y = rotY
  return g
}
function empty(name, x, y, z) {
  const o = new THREE.Object3D()
  o.name = name
  o.position.set(x, y, z)
  return o
}
// A sticker: white paper disc with a coloured ink disc on top, slightly turned like it was stuck on by hand.
function sticker(name, color, r, pos, rot = [0, 0, 0]) {
  const g = group(name, pos)
  g.rotation.set(...rot)
  g.add(cyl(r, mm(0.6), M.stickerPaper, `${name}-paper`, [0, 0, 0], [0, 0, 0], 40))
  g.add(cyl(r * 0.78, mm(0.5), std(color, { roughness: 0.5 }), `${name}-ink`, [0, mm(0.5), 0], [0, 0, 0], 40))
  return g
}

const scene = new THREE.Scene()
scene.name = 'desk'
const TOP = 0

// ---- desk -------------------------------------------------------------------------------
const DESK_W = 1.4, DESK_T = 0.03, DESK_D = 0.8
scene.add(box(DESK_W, DESK_T, DESK_D, M.wood, 'desk', [0, -DESK_T / 2, 0]))

// ---- the puck: Adafruit box 903 ---------------------------------------------------------
const PW = mm(80), PH = mm(45), PD = mm(110), LID = mm(3)
const puckPos = [-0.36, TOP, 0.10]
const puck = group('puck', puckPos, 0.18)
puck.add(box(PW, PH - LID, PD, M.abs, 'puck-shell', [0, (PH - LID) / 2, 0]))
puck.add(box(PW, LID, PD, glass(), 'puck-lid', [0, PH - LID / 2, 0]))
// NeoPixel ring under the lid: PCB torus + 16 pixels
const RING_R = mm(44.5) / 2 - mm(2.5)
const ringY = PH - mm(9), ringZ = -mm(12)
puck.add(mesh(new THREE.TorusGeometry(RING_R, mm(2.5), 10, 48), M.pcbRing, 'puck-ring', [0, ringY, ringZ], [Math.PI / 2, 0, 0]))
for (let i = 0; i < 16; i++) {
  const a = (i / 16) * Math.PI * 2
  puck.add(box(mm(5), mm(1.6), mm(5), M.led, `puck-led-${i}`, [Math.cos(a) * RING_R, ringY + mm(3.3), ringZ + Math.sin(a) * RING_R], [0, -a, 0]))
}
// button through the lid at the front
puck.add(cyl(mm(6), mm(6), M.red, 'puck-button', [0, PH + mm(1.5), mm(40)], [0, 0, 0], 28))
puck.add(mesh(new THREE.SphereGeometry(mm(5.8), 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.red, 'puck-button-cap', [0, PH + mm(4.5), mm(40)]))
// speaker grille: 15 holes on a 5 mm grid on the front face; mic pinhole beside it
const grille = group('puck-grille', [0, mm(18), PD / 2 + mm(0.2)])
for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
  grille.add(cyl(mm(1.5), mm(1), M.black, `puck-grille-hole-${r * 5 + c}`, [(c - 2) * mm(5), (r - 1) * mm(5), 0], [Math.PI / 2, 0, 0], 12))
}
puck.add(grille)
puck.add(cyl(mm(1), mm(1), M.black, 'puck-mic', [mm(28), mm(30), PD / 2 + mm(0.2)], [Math.PI / 2, 0, 0], 10))
// USB-C plug and cable out of the left side, curving away to the desk edge
puck.add(box(mm(12), mm(6), mm(9), M.black, 'puck-plug', [-PW / 2 - mm(6), mm(14), -mm(30)]))
{
  const p0 = new THREE.Vector3(-PW / 2 - mm(12), mm(14), -mm(30))
  const curve = new THREE.CatmullRomCurve3([
    p0,
    p0.clone().add(new THREE.Vector3(-0.06, -0.006, 0.02)),
    p0.clone().add(new THREE.Vector3(-0.12, -0.012, -0.10)),
    p0.clone().add(new THREE.Vector3(-0.16, -0.013, -0.34)),
  ])
  puck.add(mesh(new THREE.TubeGeometry(curve, 40, mm(2), 10, false), M.cable, 'puck-cable'))
}
// stickers: one per build, three on the lid, two on the shell front
puck.add(sticker('sticker-snake', '#5fbf6a', mm(9), [-mm(20), PH + mm(0.3), -mm(35)], [0, 0.35, 0]))
puck.add(sticker('sticker-holo', '#7fe0e8', mm(8), [mm(22), PH + mm(0.3), -mm(30)], [0, -0.5, 0]))
puck.add(sticker('sticker-robot', '#f0a15a', mm(7.5), [-mm(24), PH + mm(0.3), mm(18)], [0, 0.9, 0]))
puck.add(sticker('sticker-hooks', '#e86b6b', mm(8), [mm(24), mm(24), PD / 2 + mm(0.2)], [Math.PI / 2, 0, 0.3]))
puck.add(sticker('sticker-puck', '#58a6ff', mm(9), [PW / 2 + mm(0.2), mm(22), -mm(20)], [0, 0, -Math.PI / 2]))
scene.add(puck)

// ---- the dev board beside the puck (ESP32-S3 DevKitC) ------------------------------------
const board = group('devkit', [-0.19, TOP, 0.25], -0.35)
board.add(box(mm(26), mm(1.6), mm(56), M.pcb, 'devkit-board', [0, mm(0.8), 0]))
board.add(box(mm(9), mm(1.2), mm(9), M.chip, 'devkit-chip', [0, mm(2.2), -mm(6)]))
board.add(box(mm(16), mm(2.4), mm(14), M.silver, 'devkit-module', [0, mm(2.8), -mm(17)]))
board.add(box(mm(9), mm(3), mm(7), M.silver, 'devkit-usb', [0, mm(3.1), mm(25)]))
board.add(box(mm(2.5), mm(2.5), mm(52), M.black, 'devkit-pins-l', [-mm(11.5), mm(2.9), 0]))
board.add(box(mm(2.5), mm(2.5), mm(52), M.black, 'devkit-pins-r', [mm(11.5), mm(2.9), 0]))
scene.add(board)

// ---- laptop ------------------------------------------------------------------------------
const lapPos = [0.10, TOP, -0.12]
const laptop = group('laptop', lapPos, -0.06)
laptop.add(box(0.31, 0.014, 0.22, M.silver, 'laptop-base', [0, 0.007, 0]))
for (let r = 0; r < 5; r++) for (let c = 0; c < 14; c++) {
  laptop.add(box(0.016, 0.0022, 0.016, M.key, `laptop-key-${r}-${c}`, [(c - 6.5) * 0.019, 0.0151, -0.055 + r * 0.019]))
}
laptop.add(box(0.10, 0.0012, 0.058, M.chip, 'laptop-trackpad', [0, 0.0146, 0.07]))
const screen = group('laptop-screen-hinge', [0, 0.014, -0.11])
screen.rotation.x = -0.30
screen.add(box(0.31, 0.20, 0.006, M.silver, 'laptop-screen', [0, 0.10, 0]))
screen.add(box(0.29, 0.18, 0.0012, M.screenGlass, 'laptop-glass', [0, 0.10, 0.0036]))
screen.add(cyl(mm(1.2), mm(1), M.black, 'laptop-cam', [0, 0.193, 0.0042], [Math.PI / 2, 0, 0], 10))
// Sentence Snake on the screen: an eight-segment snake and its food, as small glowing cubes
const S = 0.011
const snakePath = [[-5, -3], [-4, -3], [-3, -3], [-2, -3], [-2, -2], [-2, -1], [-1, -1], [0, -1]]
snakePath.forEach(([gx, gy], i) => screen.add(box(S, S, 0.003, M.snake, `snake-seg-${i}`, [gx * (S + 0.002), 0.10 + gy * (S + 0.002), 0.0055])))
screen.add(box(S, S, 0.003, M.food, 'snake-food', [3 * (S + 0.002), 0.10 + 2 * (S + 0.002), 0.0055]))
laptop.add(screen)
scene.add(laptop)

// ---- the pyramid on its screen (D.V's Lab), with the hologram inside --------------------
const pyrPos = [0.40, TOP, -0.09]
const pyr = group('pyramid', pyrPos, 0.25)
pyr.add(box(0.17, 0.008, 0.17, M.monitor, 'pyramid-base', [0, 0.004, 0]))
pyr.add(box(0.15, 0.0012, 0.15, M.monitorFace, 'pyramid-face', [0, 0.0086, 0]))
pyr.add(mesh(new THREE.CylinderGeometry(0.078, 0.014, 0.072, 4, 1, true), glass('#dff0f6'), 'pyramid-glass', [0, 0.009 + 0.036, 0], [0, Math.PI / 4, 0]))
const holo = group('holo-figure', [0, 0.009 + 0.036, 0])
holo.add(box(0.028, 0.004, 0.036, M.holo, 'holo-plate-0', [0, -0.016, 0]))
holo.add(mesh(new THREE.TorusGeometry(0.012, 0.0025, 8, 32), M.holo, 'holo-ring', [0, 0, 0], [Math.PI / 2, 0, 0]))
holo.add(box(0.028, 0.003, 0.036, M.holo, 'holo-plate-1', [0, 0.016, 0]))
pyr.add(holo)
scene.add(pyr)

// ---- notebook and pen --------------------------------------------------------------------
const nbPos = [-0.08, TOP, 0.28]
const nb = group('notebook', nbPos, 0.14)
nb.add(box(0.146, 0.014, 0.206, M.pages, 'notebook-pages', [0, 0.007, 0]))
nb.add(box(0.15, 0.005, 0.21, M.cover, 'notebook-cover', [0, 0.0165, 0]))
nb.add(box(0.008, 0.006, 0.21, M.band, 'notebook-band', [0.045, 0.0165, 0]))
nb.add(sticker('sticker-notebook', '#5fbf6a', mm(9), [-0.035, 0.0193, -0.05], [0, -0.2, 0]))
nb.add(cyl(mm(4), 0.14, M.pen, 'pen', [0.11, mm(4), 0.02], [Math.PI / 2, 0, 0.35], 16))
scene.add(nb)

// ---- the hooks card (make-your-claude) -------------------------------------------------
const cardPos = [0.30, TOP, 0.31]
const card = group('hooks', cardPos, -0.25)
card.add(box(0.09, 0.003, 0.055, M.card, 'hooks-card', [0, 0.0015, 0]))
card.add(box(0.07, 0.0012, 0.006, M.black, 'hooks-title', [0, 0.0036, -0.018]))
const hookColors = ['#e86b6b', '#58a6ff', '#5fbf6a', '#f0a15a', '#7fe0e8', '#9b7fe0']
hookColors.forEach((c, i) => card.add(cyl(mm(3), mm(1.2), std(c, { roughness: 0.5 }), `hooks-dot-${i}`, [(i % 3 - 1) * 0.02, 0.0036, (i < 3 ? -0.002 : 0.014)], [0, 0, 0], 20)))
scene.add(card)

// ---- mug ----------------------------------------------------------------------------------
const mugPos = [0.62, TOP, -0.18]
const mug = group('mug-group', mugPos)
mug.add(cyl(0.04, 0.095, M.mug, 'mug', [0, 0.0475, 0]))
mug.add(cyl(0.036, 0.002, M.coffee, 'mug-coffee', [0, 0.086, 0]))
mug.add(mesh(new THREE.TorusGeometry(0.024, 0.006, 10, 24, Math.PI), M.mug, 'mug-handle', [0.04, 0.05, 0], [0, 0, -Math.PI / 2]))
scene.add(mug)


// ---- the cat: black and white, sitting on the front-right corner, eyes that follow the cursor ----
const catPos = [0.56, TOP, 0.27]
const cat = group('cat', catPos, -0.55)
const sph = (r, material, name, pos, scale = [1, 1, 1]) => {
  const m = mesh(new THREE.SphereGeometry(r, 28, 18), material, name, pos)
  m.scale.set(...scale)
  return m
}
cat.add(sph(0.07, M.fur, 'cat-body', [0, 0.085, -0.01], [1, 1.25, 0.95]))
cat.add(sph(0.046, M.furWhite, 'cat-chest', [0, 0.08, 0.042]))
cat.add(mesh(new THREE.CylinderGeometry(0.017, 0.019, 0.07, 16), M.fur, 'cat-leg-l', [-0.03, 0.045, 0.058]))
cat.add(mesh(new THREE.CylinderGeometry(0.017, 0.019, 0.07, 16), M.fur, 'cat-leg-r', [0.03, 0.045, 0.058]))
cat.add(sph(0.019, M.furWhite, 'cat-paw-l', [-0.03, 0.014, 0.072], [1, 0.75, 1.2]))
cat.add(sph(0.019, M.furWhite, 'cat-paw-r', [0.03, 0.014, 0.072], [1, 0.75, 1.2]))
cat.add(sph(0.052, M.fur, 'cat-head', [0, 0.20, 0.03]))
cat.add(sph(0.03, M.furWhite, 'cat-muzzle', [0, 0.183, 0.066], [1.25, 0.8, 0.9]))
cat.add(sph(0.006, M.pink, 'cat-nose', [0, 0.194, 0.093]))
for (const [side, sx] of [['l', -1], ['r', 1]]) {
  cat.add(mesh(new THREE.ConeGeometry(0.02, 0.04, 4), M.fur, `cat-ear-${side}`, [sx * 0.033, 0.245, 0.02], [0.1, Math.PI / 4, sx * -0.35]))
  cat.add(mesh(new THREE.ConeGeometry(0.011, 0.024, 4), M.pink, `cat-ear-${side}-inner`, [sx * 0.033, 0.243, 0.026], [0.15, Math.PI / 4, sx * -0.35]))
  // an eye is a group: rotating it sweeps the pupil, which is what the scene's eye-follow does
  const eye = group(`cat-eye-${side}`, [sx * 0.021, 0.208, 0.072])
  eye.add(sph(0.0115, M.catEye, `cat-orb-${side}`, [0, 0, 0]))
  eye.add(sph(0.0048, M.pupil, `cat-pupil-${side}`, [0, 0, 0.0085], [0.55, 1, 1]))
  cat.add(eye)
  for (let w = 0; w < 3; w++) {
    cat.add(mesh(new THREE.CylinderGeometry(0.0006, 0.0006, 0.055, 6), M.whisker, `cat-whisker-${side}-${w}`, [sx * 0.045, 0.186 + (w - 1) * 0.006, 0.085], [0, 0, sx * (Math.PI / 2 - 0.15 + (w - 1) * 0.12)]))
  }
}
{
  const tail = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.02, 0.045, -0.06),
    new THREE.Vector3(0.07, 0.02, -0.07),
    new THREE.Vector3(0.11, 0.012, -0.03),
    new THREE.Vector3(0.12, 0.012, 0.03),
  ])
  cat.add(mesh(new THREE.TubeGeometry(tail, 24, 0.011, 10, false), M.fur, 'cat-tail'))
  cat.add(sph(0.012, M.furWhite, 'cat-tail-tip', [0.12, 0.012, 0.034]))
}
cat.add(mesh(new THREE.TorusGeometry(0.041, 0.006, 10, 32), M.collar, 'cat-collar', [0, 0.16, 0.03], [Math.PI / 2 - 0.35, 0, 0]))
cat.add(cyl(mm(8), mm(1.5), M.brass, 'cat-tag', [0, 0.135, 0.072], [Math.PI / 2 - 0.2, 0, 0], 20))
scene.add(cat)

// ---- personal touches: initials on the mug, a photo frame that the scene shows once a photo exists ----
{
  const fontJson = JSON.parse(readFileSync(new URL('../node_modules/three/examples/fonts/gentilis_bold.typeface.json', import.meta.url), 'utf8'))
  const font = new FontLoader().parse(fontJson)
  const geo = new TextGeometry('DM', { font, size: 0.024, depth: 0.0025, curveSegments: 6 })
  geo.computeBoundingBox()
  const w = geo.boundingBox.max.x - geo.boundingBox.min.x
  const initials = mesh(geo, M.initials, 'mug-initials', [0, 0.036, 0.0405])
  initials.position.x = -w / 2
  mug.add(initials)
  mug.rotation.y = 0.55
}
const framePos = [0.30, TOP, -0.30]
const frame = group('photo-frame', framePos, -0.25)
frame.rotation.x = -0.18
frame.add(box(0.104, 0.134, 0.006, M.frameWood, 'frame-border', [0, 0.067, 0]))
frame.add(box(0.088, 0.118, 0.0012, M.photoBlank, 'frame-photo', [0, 0.067, 0.0036]))
frame.add(box(0.02, 0.09, 0.004, M.frameWood, 'frame-stand', [0, 0.045, -0.02], [-0.35, 0, 0]))
scene.add(frame)

// ---- focus anchors -----------------------------------------------------------------------
const puckC = [puckPos[0], TOP + PH / 2, puckPos[2]]
const lapC = [lapPos[0], TOP + 0.12, lapPos[2] - 0.09]
const pyrC = [pyrPos[0], TOP + 0.045, pyrPos[2]]
const nbC = [nbPos[0], TOP + 0.012, nbPos[2]]
const cardC = [cardPos[0], TOP + 0.004, cardPos[2]]
scene.add(empty('focus-0', 0.02, TOP + 0.06, 0.02))
scene.add(empty('focus-1', ...puckC))
scene.add(empty('focus-2', ...lapC))
scene.add(empty('focus-3', ...pyrC))
scene.add(empty('focus-4', ...nbC))
scene.add(empty('focus-5', ...cardC))
scene.add(empty('focus-works', 0, TOP + 0.05, 0))

// ---- camera + CameraAction ---------------------------------------------------------------
const camera = new THREE.PerspectiveCamera(23, 1, 0.05, 50)
camera.name = 'Camera'
scene.add(camera)

// [frame, position, lookAt]
const poses = [
  [0, [0.55, 0.95, 2.55], [0.02, 0.03, 0.0]],
  [50, [puckC[0] + 0.17, TOP + 0.21, puckC[2] + 0.36], puckC],
  [100, [lapC[0] + 0.12, TOP + 0.31, lapC[2] + 0.60], lapC],
  [150, [pyrC[0] + 0.15, TOP + 0.17, pyrC[2] + 0.38], pyrC],
  [200, [nbC[0] + 0.06, TOP + 0.36, nbC[2] + 0.42], nbC],
  [250, [cardC[0] + 0.10, TOP + 0.21, cardC[2] + 0.31], cardC],
  [250 + WORKS_TAIL, [0.1, 1.55, 2.0], [0, 0.05, 0]],
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

let meshes = 0
scene.traverse((o) => { if (o.isMesh) meshes++ })

const exporter = new GLTFExporter()
exporter.parse(
  scene,
  (result) => {
    writeFileSync(out, Buffer.from(result))
    console.log(`wrote ${out} (${Buffer.byteLength(Buffer.from(result))} bytes, ${meshes} meshes); CameraAction ${250 + WORKS_TAIL} frames @ ${FPS} fps, ${NODES} stops, ${FRAMES_PER_NODE} frames apart`)
  },
  (err) => {
    console.error('export failed:', err)
    process.exit(1)
  },
  { binary: true, animations: [clip], onlyVisible: true, trs: true }
)
