import * as THREE from 'three'

// The D.V board, drawn onto a 2D canvas that is the laptop screen's texture. A look-alike of the
// session board Devak runs his agents from, with FABRICATED data: every ticket, count and line here
// is invented. Clicking the pill wakes D.V: the globe goes thinking then speaking, four staff lines
// type out an invented investigation, a card moves to Done, and the puck's ring on the desk follows
// the state through a `dv-state` DOM event (scene/Scene.tsx listens). `dv-runs` fires per completed run.
// Four prompt chips beside the pill ask D.V about Devak; those answers are true, unlike the tickets,
// and arrive in the log one line at a time. The "follow" answer's lines are links.

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

// The prompts a visitor can pick. Answers are about Devak and are true. A line with a url is a link.
interface Line {
  who: string
  text: string
  url?: string
}
interface Prompt {
  label: string
  lines: Line[]
}
const PROMPTS: Prompt[] = [
  {
    label: 'Who is Devak?',
    lines: [
      { who: 'D.V', text: 'Devak Mehta, AI engineer. One laptop with an integrated GPU: decision models, a voice puck, a hand-tracked lab, and me.' },
      { who: 'D.V', text: 'Own code, vendored models, nothing leaves the machine. Every build ships with one measured number.' },
    ],
  },
  {
    label: 'Building now',
    lines: [
      { who: 'D.V', text: "The puck's microphone and wake word are next on the bench." },
      { who: 'D.V', text: 'Snake gets a ranking head, the way Tetris did; the pyramid moves to a spare monitor.' },
      { who: 'D.V', text: 'And me: new staff as the work needs them.' },
    ],
  },
  {
    label: 'The puck',
    lines: [
      { who: 'D.V', text: 'A talking assistant on the desk: wake word, question, answer through the model on the laptop.' },
      { who: 'D.V', text: 'Its 16-light ring shows listening, thinking, speaking. Audio never leaves the local network.' },
    ],
  },
  {
    label: 'Follow Devak',
    lines: [
      { who: 'GITHUB', text: 'github.com/devakmmm', url: 'https://github.com/devakmmm' },
      { who: 'HOME', text: 'devakmmm.github.io · one page per build', url: 'https://devakmmm.github.io/' },
    ],
  },
]
// answer timing: a short think, then one line per step, then hold before idle
const ANSWER_THINK = 500
const ANSWER_STEP = 420
const ANSWER_HOLD = 1400

const INK = '#f4f1ea'
const MUTED = 'rgba(244,241,234,.55)'
const LINE = 'rgba(244,241,234,.14)'
const ACCENT = '#c9a961'
const CYAN = '#7fd0ff'
const FONT = 'Helvetica Neue, system-ui, sans-serif'
const MONO = 'ui-monospace, Menlo, Consolas, monospace'

// the pill's hit box, in canvas px; the prompt chips run to its right
const PILL = { x: 28, y: 232, w: 300, h: 44 }
const CHIP = { x: 352, size: 12, spacing: 3, pad: 22, gap: 12 }
const LOG = { x: 28, textX: 118, line: 626, first: 644, step: 24 }

interface Box {
  x: number
  y: number
  w: number
  h: number
}

function emit(name: string, detail: unknown) {
  window.dispatchEvent(new CustomEvent(name, { detail }))
}

// the visitor's own clock, in the menu bar
function clock() {
  const d = new Date()
  return `${d.toLocaleDateString([], { weekday: 'short' })} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}

export function createDvBoard() {
  // drawn at 2× on anything wider than a phone: first person at the laptop (scene/Scene.tsx) puts
  // this canvas across the whole view, and text drawn at 1× goes soft there
  const S = typeof window !== 'undefined' && window.innerWidth > 640 ? 2 : 1
  const canvas = document.createElement('canvas')
  canvas.width = W * S
  canvas.height = H * S
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  ctx.scale(S, S)
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
  let answer: Prompt | null = null
  let answerStart = 0
  let answerFired = 0
  let hoverKey: string | null = null // 'pill' | 'chip:i' | 'link:i'
  let theta = 0
  let lastDraw = 0
  let lastTick = 0
  let cols: { name: string; cards: string[] }[] = fresh()
  let lines: Line[] = []
  let chips: Box[] = []
  let links: (Box & { url: string })[] = []

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
    answer = null
    lines = []
    cols = fresh()
  }

  function ask(i: number, now: number) {
    if (runStart >= 0 || !PROMPTS[i]) return
    answer = PROMPTS[i]
    answerStart = now
    answerFired = 0
    lines = []
  }

  function tick(now: number) {
    if (runStart >= 0) {
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
    } else if (answer) {
      const t = now - answerStart
      if (t < ANSWER_THINK) {
        setState('thinking')
      } else {
        const due = Math.min(answer.lines.length, 1 + Math.floor((t - ANSWER_THINK) / ANSWER_STEP))
        while (answerFired < due) lines.push(answer.lines[answerFired++])
        setState('speaking')
        if (answerFired >= answer.lines.length && t > ANSWER_THINK + answer.lines.length * ANSWER_STEP + ANSWER_HOLD) {
          answer = null
          setState('idle')
        }
      }
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

  // the width label() will draw for a letter-spaced string
  function spacedWidth(text: string, size: number, spacing: number) {
    ctx.font = `${size}px ${FONT}`
    let total = 0
    for (const ch of text) total += ctx.measureText(ch).width + spacing
    return total
  }

  // a one-line label that shrinks its font until it fits maxW
  function fit(text: string, x: number, y: number, size: number, color: string, maxW: number) {
    ctx.font = `${size}px ${FONT}`
    const w = ctx.measureText(text).width
    label(text, x, y, w > maxW ? Math.max(11, Math.floor((size * maxW) / w)) : size, color)
  }

  function layoutChips() {
    let x = CHIP.x
    chips = PROMPTS.map((p) => {
      const w = spacedWidth(p.label.toUpperCase(), CHIP.size, CHIP.spacing) + CHIP.pad * 2
      const box = { x, y: PILL.y, w, h: PILL.h }
      x += w + CHIP.gap
      return box
    })
  }

  function inBox(b: Box, x: number, y: number, m = 0) {
    return x >= b.x - m && x <= b.x + b.w + m && y >= b.y - m && y <= b.y + b.h + m
  }

  // what sits under a canvas point: the pill, a chip, a link line, or nothing
  function target(x: number, y: number): string | null {
    if (inBox(PILL, x, y, 8)) return 'pill'
    for (let i = 0; i < chips.length; i++) if (inBox(chips[i], x, y, 4)) return `chip:${i}`
    for (let i = 0; i < links.length; i++) if (inBox(links[i], x, y, 4)) return `link:${i}`
    return null
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
    if (chips.length === 0) layoutChips()
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#0b0e13'
    ctx.fillRect(0, 0, W, H)
    if (hoverKey === 'pill' && !running) {
      ctx.fillStyle = 'rgba(244,241,234,.035)'
      ctx.fillRect(0, 0, W, H)
    }

    // the menu bar: whose laptop this is, and the visitor's own clock
    ctx.fillStyle = 'rgba(244,241,234,.05)'
    ctx.fillRect(0, 0, W, 26)
    label('Devak Mehta · AI Engineer', 28, 17, 11, INK, { spacing: 2.5, upper: true })
    label(clock(), W - 28, 17, 11, MUTED, { align: 'right', font: MONO })

    // header
    label('D.V · session board', 28, 52, 15, ACCENT, { spacing: 4, upper: true })
    label(`Ops floor · ${state === 'idle' ? 'all quiet' : state}`, 28, 90, 26, INK)
    label('LIVE · 3 sessions · 18 tickets', 940, 56, 14, MUTED, { align: 'right' })
    label('0 alerts · read-only · nothing leaves the machine', 940, 80, 14, MUTED, { align: 'right' })
    drawGlobe(1050, 90, 62, now, dt)

    // what this is, in two lines; each shrinks to fit the band left of the globe
    fit('D.V is the assistant I built: it triages a ticket, runs the checks, files the pull request and posts the verdict here.', 28, 150, 16, INK, 930)
    fit("I keep adding staff to it. This is a look-alike with invented data; the real one runs on my laptop, and the puck's ring follows it.", 28, 178, 16, MUTED, 930)

    // the pill
    const pulse = running ? 0 : (Math.sin(now / 300) + 1) / 2
    ctx.strokeStyle = `rgba(201,169,97,${0.25 + pulse * 0.35})`
    ctx.lineWidth = 8
    roundRect(PILL.x - 4, PILL.y - 4, PILL.w + 8, PILL.h + 8, 26)
    ctx.stroke()
    ctx.strokeStyle = ACCENT
    ctx.lineWidth = 1.5
    ctx.fillStyle = hoverKey === 'pill' && !running ? 'rgba(201,169,97,.18)' : 'rgba(201,169,97,.06)'
    roundRect(PILL.x, PILL.y, PILL.w, PILL.h, 22)
    ctx.fill()
    ctx.stroke()
    label(running ? 'working…' : runs === 0 ? 'click me · wake D.V' : 'again', PILL.x + 22, PILL.y + 29, 14, running ? MUTED : ACCENT, { spacing: 3, upper: true })

    // the prompt chips: ask D.V about Devak
    chips.forEach((c, i) => {
      const hot = hoverKey === `chip:${i}` && !running
      ctx.strokeStyle = hot ? ACCENT : LINE
      ctx.lineWidth = 1.5
      ctx.fillStyle = hot ? 'rgba(201,169,97,.12)' : 'rgba(244,241,234,.03)'
      roundRect(c.x, c.y, c.w, c.h, 22)
      ctx.fill()
      ctx.stroke()
      label(PROMPTS[i].label, c.x + CHIP.pad, c.y + 29, CHIP.size, hot ? ACCENT : INK, { spacing: CHIP.spacing, upper: true })
    })

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

    // the log: the last three lines; link lines are drawn in gold, underlined, and remembered for clicks
    ctx.strokeStyle = LINE
    ctx.beginPath()
    ctx.moveTo(LOG.x, LOG.line)
    ctx.lineTo(W - 28, LOG.line)
    ctx.stroke()
    links = []
    if (lines.length === 0) {
      label(`› idle. ${runs > 0 ? 'ticket 1042 closed. ' : ''}ask me about Devak, or click the pill.`, LOG.x, LOG.first + 12, 14, MUTED, { font: MONO })
    } else {
      let ly = LOG.first
      for (const l of lines.slice(-3)) {
        label(l.who, LOG.x, ly, 14, l.url ? ACCENT : CYAN, { font: MONO })
        if (l.url) {
          const text = `· ${l.text}`
          const hot = hoverKey === `link:${links.length}`
          label(text, LOG.textX, ly, 14, hot ? INK : ACCENT, { font: MONO })
          ctx.font = `14px ${MONO}`
          const w = ctx.measureText(text).width
          ctx.strokeStyle = hot ? INK : ACCENT
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(LOG.textX, ly + 4)
          ctx.lineTo(LOG.textX + w, ly + 4)
          ctx.stroke()
          links.push({ x: LOG.textX, y: ly - 15, w, h: 22, url: l.url })
        } else {
          label(`· ${l.text}`, LOG.textX, ly, 14, INK, { font: MONO })
        }
        ly += LOG.step
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
      hoverKey = u === null || v === undefined ? null : target(u * W, v * H)
    },
    hovering() {
      return hoverKey !== null
    },
    click(u: number, v: number) {
      const key = target(u * W, v * H)
      const now = performance.now()
      if (key === 'pill' || (key === null && runs === 0 && !answer)) start(now)
      else if (key && key.startsWith('chip:')) ask(Number(key.slice(5)), now)
      else if (key && key.startsWith('link:')) window.open(links[Number(key.slice(5))].url, '_blank', 'noopener,noreferrer')
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
