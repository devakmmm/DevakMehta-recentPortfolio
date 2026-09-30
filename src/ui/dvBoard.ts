import * as THREE from 'three'

// The D.V board, drawn onto a 2D canvas that is the laptop screen's texture. A look-alike of the
// session board Devak runs his agents from, with FABRICATED data: every ticket, count and line here
// is invented. Clicking the pill wakes D.V: the globe goes thinking then speaking, four staff lines
// type out an invented investigation, a card moves to Done, and the puck's ring on the desk follows
// the state through a `dv-state` DOM event (scene/Scene.tsx listens). `dv-runs` fires per completed run.

export type DvState = 'idle' | 'thinking' | 'speaking'

const W = 1160
const H = 720
const FPS = 24

const SCRIPT: { at: number; who: string; text: string; state: DvState }[] = [
  { at: 0, who: 'TRIAGE', text: 'picked ticket 1042 · import stuck for 31 s', state: 'thinking' },
  { at: 1300, who: 'RUNNER', text: '3 checks · 12 rows · 0.8 s · no writes', state: 'thinking' },
  { at: 2700, who: 'VERDICT', text: 'not ours: the upstream call timed out at 30 s', state: 'speaking' },
  { at: 4100, who: 'DIGEST', text: 'posted to the board · ring back to idle', state: 'speaking' },
]
const DONE_AT = 5600

const STAFF = [
  { id: 'TRIAGE', job: 'picks the ticket, names the symptom' },
  { id: 'RUNNER', job: 'runs the checks, read-only, counts rows' },
  { id: 'DIGEST', job: 'writes the verdict to the board' },
  { id: 'AUTOPSY', job: 'replays a run step by step' },
]

const INK = '#f4f1ea'
const MUTED = 'rgba(244,241,234,.55)'
const LINE = 'rgba(244,241,234,.14)'
const ACCENT = '#c9a961'
const CYAN = '#7fd0ff'
const FONT = 'Helvetica Neue, system-ui, sans-serif'
const MONO = 'ui-monospace, Menlo, Consolas, monospace'

// the pill's hit box, in canvas px
const PILL = { x: 28, y: 232, w: 300, h: 44 }

function emit(name: string, detail: unknown) {
  window.dispatchEvent(new CustomEvent(name, { detail }))
}

export function createDvBoard() {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4

  // globe points (fibonacci sphere), hollow, one hue
  const N = 360
  const pts: [number, number, number][] = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const a = golden * i
    pts.push([Math.cos(a) * r, y, Math.sin(a) * r])
  }

  let state: DvState = 'idle'
  let runStart = -1
  let runs = 0
  let stepsFired = 0
  let hover = false
  let theta = 0
  let lastDraw = 0
  let lastTick = 0
  let cols: { name: string; cards: string[] }[] = fresh()
  let lines: { who: string; text: string }[] = []

  function fresh() {
    return [
      { name: 'Queued', cards: ['1051 · rerun after fix', '1052 · missing month', '1053 · four rejected'] },
      { name: 'Building', cards: ['1047 · duplicate rows', '1042 · import stuck'] },
      { name: 'Blocked', cards: ['1039 · waiting on upstream'] },
      { name: 'Done', cards: ['1036', '1035', '1033', '1031', '1030', '1029', '1027', '1025', '1024', '1022', '1021', '1019'] },
    ]
  }

  function setState(s: DvState) {
    if (s === state) return
    state = s
    emit('dv-state', s)
  }

  function start(now: number) {
    if (runStart >= 0) return
    runStart = now
    stepsFired = 0
    lines = []
    cols = fresh()
  }

  function tick(now: number) {
    if (runStart < 0) return
    const t = now - runStart
    while (stepsFired < SCRIPT.length && t >= SCRIPT[stepsFired].at) {
      const s = SCRIPT[stepsFired]
      setState(s.state)
      lines.push({ who: s.who, text: s.text })
      stepsFired++
    }
    if (t >= DONE_AT) {
      runStart = -1
      runs++
      setState('idle')
      cols = cols.map((c) =>
        c.name === 'Building'
          ? { ...c, cards: c.cards.filter((x) => !x.startsWith('1042')) }
          : c.name === 'Done'
            ? { ...c, cards: ['1042 · not ours', ...c.cards] }
            : c
      )
      emit('dv-runs', runs)
    }
  }

  function roundRect(x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
  }

  function label(text: string, x: number, y: number, size: number, color: string, opts: { spacing?: number; font?: string; align?: CanvasTextAlign; upper?: boolean } = {}) {
    ctx.font = `${size}px ${opts.font || FONT}`
    ctx.fillStyle = color
    ctx.textAlign = opts.align || 'left'
    ctx.textBaseline = 'alphabetic'
    const s = opts.upper ? text.toUpperCase() : text
    if (opts.spacing) {
      // manual letter-spacing
      let cx = x
      if (ctx.textAlign === 'right') {
        let total = 0
        for (const ch of s) total += ctx.measureText(ch).width + opts.spacing
        cx = x - total
        ctx.textAlign = 'left'
      }
      for (const ch of s) {
        ctx.fillText(ch, cx, y)
        cx += ctx.measureText(ch).width + opts.spacing
      }
    } else {
      ctx.fillText(s, x, y)
    }
  }

  function drawGlobe(cx: number, cy: number, R0: number, now: number, dt: number) {
    theta += dt * (state === 'idle' ? 0.35 : state === 'thinking' ? 0.9 : 1.4)
    const t = now / 1000
    const R = R0 * (state === 'speaking' ? 1 + Math.sin(t * 9) * 0.06 : 1)
    for (let i = 0; i < N; i++) {
      const [x, y, z] = pts[i]
      const xr = x * Math.cos(theta) + z * Math.sin(theta)
      const zr = -x * Math.sin(theta) + z * Math.cos(theta)
      const scatter = state === 'thinking' ? 1 + Math.sin(t * 2.2 + i * 0.7) * 0.12 : 1
      const depth = (zr + 1) / 2
      ctx.fillStyle = `rgba(127, 208, 255, ${0.18 + depth * 0.72})`
      ctx.beginPath()
      ctx.arc(cx + xr * R * scatter, cy + y * R * scatter, 1.2 + depth * 1.6, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  function draw(now: number, dt: number) {
    const running = runStart >= 0
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#0b0e13'
    ctx.fillRect(0, 0, W, H)
    if (hover && !running) {
      ctx.fillStyle = 'rgba(244,241,234,.035)'
      ctx.fillRect(0, 0, W, H)
    }

    // header
    label('D.V · session board', 28, 52, 15, ACCENT, { spacing: 4, upper: true })
    label(`Ops floor · ${state === 'idle' ? 'all quiet' : state}`, 28, 90, 26, INK)
    label('LIVE · 3 sessions · 18 tickets', 940, 56, 14, MUTED, { align: 'right' })
    label('0 alerts · read-only · nothing leaves the machine', 940, 80, 14, MUTED, { align: 'right' })
    drawGlobe(1050, 90, 62, now, dt)

    // the pill
    const pulse = running ? 0 : (Math.sin(now / 300) + 1) / 2
    ctx.strokeStyle = `rgba(201,169,97,${0.25 + pulse * 0.35})`
    ctx.lineWidth = 8
    roundRect(PILL.x - 4, PILL.y - 4, PILL.w + 8, PILL.h + 8, 26)
    ctx.stroke()
    ctx.strokeStyle = ACCENT
    ctx.lineWidth = 1.5
    ctx.fillStyle = hover && !running ? 'rgba(201,169,97,.18)' : 'rgba(201,169,97,.06)'
    roundRect(PILL.x, PILL.y, PILL.w, PILL.h, 22)
    ctx.fill()
    ctx.stroke()
    label(running ? 'working…' : runs === 0 ? 'click me · wake D.V' : 'again', PILL.x + 22, PILL.y + 29, 14, running ? MUTED : ACCENT, { spacing: 3, upper: true })
    label(running ? 'the ring on the desk follows the state' : 'one click runs an investigation, invented data', PILL.x + PILL.w + 18, PILL.y + 28, 14, MUTED)

    // staff cards
    let y = 306
    for (const s of STAFF) {
      const active = lines.some((l) => l.who === s.id) || (running && s.id === 'TRIAGE' && lines.length === 0)
      ctx.strokeStyle = active ? CYAN : LINE
      ctx.lineWidth = 1.5
      roundRect(28, y, 300, 62, 12)
      ctx.stroke()
      label(s.id, 44, y + 26, 13, active ? CYAN : INK, { spacing: 3 })
      label(s.job, 44, y + 48, 13, MUTED)
      y += 74
    }

    // kanban
    const colX = 352, colW = 190, colGap = 14, colY = 306, colH = 296
    cols.forEach((col, i) => {
      const x = colX + i * (colW + colGap)
      ctx.strokeStyle = LINE
      ctx.lineWidth = 1.5
      roundRect(x, colY, colW, colH, 12)
      ctx.stroke()
      label(`${col.name} · ${col.cards.length}`, x + 14, colY + 26, 11, MUTED, { spacing: 2.5, upper: true })
      let cy = colY + 44
      for (const c of col.cards.slice(0, 6)) {
        ctx.fillStyle = 'rgba(244,241,234,.07)'
        roundRect(x + 12, cy, colW - 24, 30, 6)
        ctx.fill()
        ctx.save()
        ctx.beginPath()
        ctx.rect(x + 12, cy, colW - 24, 30)
        ctx.clip()
        label(c, x + 22, cy + 20, 13, INK)
        ctx.restore()
        cy += 38
      }
      if (col.cards.length > 6) label(`+${col.cards.length - 6} more`, x + 14, cy + 14, 11, MUTED)
    })

    // the log
    ctx.strokeStyle = LINE
    ctx.beginPath()
    ctx.moveTo(28, 626)
    ctx.lineTo(W - 28, 626)
    ctx.stroke()
    if (lines.length === 0) {
      label(`› idle. ${runs > 0 ? 'ticket 1042 closed.' : 'waiting for a click.'}`, 28, 656, 14, MUTED, { font: MONO })
    } else {
      let ly = 652
      for (const l of lines.slice(-3)) {
        label(l.who, 28, ly, 14, CYAN, { font: MONO })
        label(`· ${l.text}`, 118, ly, 14, INK, { font: MONO })
        ly += 24
      }
    }
    texture.needsUpdate = true
  }

  return {
    texture,
    // called every frame; draws at FPS
    update(now: number) {
      tick(now)
      if (now - lastDraw < 1000 / FPS) return
      const dt = lastTick ? Math.min(0.05, (now - lastTick) / 1000) : 0
      lastTick = now
      lastDraw = now
      draw(now, dt)
    },
    // uv from the raycast, y already flipped to canvas space (0 = top)
    hover(u: number | null, v?: number) {
      if (u === null || v === undefined) {
        hover = false
        return
      }
      const x = u * W, y = v * H
      hover = x >= PILL.x - 8 && x <= PILL.x + PILL.w + 8 && y >= PILL.y - 8 && y <= PILL.y + PILL.h + 8
    },
    hovering() {
      return hover
    },
    click(u: number, v: number) {
      const x = u * W, y = v * H
      const onPill = x >= PILL.x - 8 && x <= PILL.x + PILL.w + 8 && y >= PILL.y - 8 && y <= PILL.y + PILL.h + 8
      if (onPill || runs === 0) start(performance.now())
    },
    running() {
      return runStart >= 0
    },
    runs() {
      return runs
    },
  }
}

export type DvBoard = ReturnType<typeof createDvBoard>
