import * as THREE from 'three'
import { PROFILE } from '../data/profile'
import { chipLabel, pillLabel, stateWord, wrapText } from './boardText'

// The D.V board, drawn onto a 2D canvas that is the laptop screen's texture. A look-alike of the
// session board Devak runs his agents from, with FABRICATED data: every ticket, count and line here
// is invented. Clicking the pill runs a demo investigation: the globe goes thinking then speaking, four
// staff lines type out into the log, a card moves to Done, and the puck's ring on the desk follows
// the state through a `dv-state` DOM event (scene/Scene.tsx listens). `dv-runs` fires per completed run.
// Four prompt chips beside the pill ask D.V about Devak. Those answers are true (they come from
// data/profile.ts, the same source as the minimalist page) and are typed into an answer card over the
// kanban, in large type; the chip reads RUNNING while its answer is being written (ui/boardText.ts).
// Link lines in the "Resume & links" answer open on click.

export type DvState = 'idle' | 'thinking' | 'speaking'

const W = 1160
const H = 720
const FPS = 24

const SCRIPT: { at: number; who: string; text: string; state: DvState }[] = [
  { at: 0, who: 'TRIAGE', text: 'picked ticket 1042, an import stuck for 31 s', state: 'thinking' },
  { at: 1300, who: 'RUNNER', text: '3 checks, 12 rows, 0.8 s, no writes', state: 'thinking' },
  { at: 2700, who: 'VERDICT', text: 'not ours: the upstream call timed out at 30 s', state: 'speaking' },
  { at: 4100, who: 'DIGEST', text: 'posted to the board, ring back to idle', state: 'speaking' },
]
const DONE_AT = 5600

const STAFF = [
  { id: 'TRIAGE', job: 'picks the ticket, names the symptom' },
  { id: 'RUNNER', job: 'runs the checks, read-only, counts rows' },
  { id: 'DIGEST', job: 'writes the verdict to the board' },
  { id: 'AUTOPSY', job: 'replays a run step by step' },
]

// The prompts a visitor can pick. A line with a url is a link.
interface Line {
  text: string
  url?: string
}
interface Prompt {
  label: string
  lines: Line[]
}

function linkLines(): Line[] {
  const L = PROFILE.links
  const lines: Line[] = []
  if (L.resume) lines.push({ text: 'Resume (PDF)', url: /^https?:/.test(L.resume) ? L.resume : `./${L.resume}` })
  if (L.email) lines.push({ text: `Email: ${L.email}`, url: `mailto:${L.email}` })
  if (L.linkedin) lines.push({ text: `LinkedIn: ${L.linkedin.replace(/^https?:\/\/(www\.)?/, '')}`, url: L.linkedin })
  lines.push({ text: `GitHub: ${L.github.replace(/^https?:\/\//, '')}`, url: L.github })
  lines.push({ text: `Home base: ${L.home.replace(/^https?:\/\/|\/$/g, '')}`, url: L.home })
  return lines
}

const PROMPTS: Prompt[] = [
  { label: 'Who is Devak?', lines: PROFILE.answers.who.map((text) => ({ text })) },
  { label: "What he's built", lines: PROFILE.answers.built.map((text) => ({ text })) },
  { label: 'Building now', lines: PROFILE.answers.now.map((text) => ({ text })) },
  { label: PROFILE.links.resume ? 'Resume & links' : 'Contact & links', lines: linkLines() },
]
// answer timing: a short think, then one line per step
const ANSWER_THINK = 450
const ANSWER_STEP = 380

const INK = '#f4f1ea'
const MUTED = 'rgba(244,241,234,.55)'
const LINE = 'rgba(244,241,234,.14)'
const ACCENT = '#c9a961'
const CYAN = '#7fd0ff'
const FONT = 'Helvetica Neue, system-ui, sans-serif'
const MONO = 'ui-monospace, Menlo, Consolas, monospace'

// hit boxes and layout, in canvas px
const PILL = { x: 28, y: 232, w: 300, h: 44 }
const CHIP = { x: 352, size: 15, pad: 22, gap: 12 }
const COLS = { x: 352, w: 190, gap: 14, y: 306, h: 296 }
const CARD = { x: 352, y: 306, w: 802, h: 396, pad: 28, size: 18, lead: 28, para: 8 }
const LOG = { x: 28, textX: 118, line: 626, first: 652, step: 24 }

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
  let shown: number | null = null // the prompt whose answer card is open
  let answering: number | null = null // the prompt being typed (its chip reads RUNNING)
  let answerStart = 0
  let answerFired = 0
  let hoverKey: string | null = null // 'pill' | 'chip:i' | 'link:i' | 'close'
  let theta = 0
  let lastDraw = 0
  let lastTick = 0
  let cols: { name: string; cards: string[] }[] = fresh()
  let lines: { who: string; text: string }[] = []
  let chips: Box[] = []
  let links: (Box & { url: string })[] = []
  let closeBox: Box | null = null

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
    shown = null
    answering = null
    lines = []
    cols = fresh()
  }

  function ask(i: number, now: number) {
    if (runStart >= 0 || !PROMPTS[i]) return
    shown = i
    answering = i
    answerStart = now
    answerFired = 0
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
    } else if (answering !== null) {
      const p = PROMPTS[answering]
      const t = now - answerStart
      if (t < ANSWER_THINK) {
        setState('thinking')
      } else {
        answerFired = Math.min(p.lines.length, 1 + Math.floor((t - ANSWER_THINK) / ANSWER_STEP))
        setState('speaking')
        if (answerFired >= p.lines.length && t > ANSWER_THINK + p.lines.length * ANSWER_STEP + 300) {
          answering = null
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

  function label(text: string, x: number, y: number, size: number, color: string, opts: { spacing?: number; font?: string; align?: CanvasTextAlign; upper?: boolean; weight?: number } = {}) {
    ctx.font = `${opts.weight ? `${opts.weight} ` : ''}${size}px ${opts.font || FONT}`
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

  // the width label() will draw, letter-spacing included
  function textWidth(text: string, size: number, spacing = 0, font = FONT) {
    ctx.font = `${size}px ${font}`
    if (!spacing) return ctx.measureText(text).width
    let total = 0
    for (const ch of text) total += ctx.measureText(ch).width + spacing
    return total
  }

  // a one-line label that shrinks its font until it fits maxW
  function fit(text: string, x: number, y: number, size: number, color: string, maxW: number) {
    const w = textWidth(text, size)
    label(text, x, y, w > maxW ? Math.max(11, Math.floor((size * maxW) / w)) : size, color)
  }

  // chips keep one width whether they show their question or RUNNING, so nothing jumps
  function layoutChips() {
    let x = CHIP.x
    chips = PROMPTS.map((p) => {
      const w = Math.max(textWidth(p.label, CHIP.size), textWidth('RUNNING', 13, 3)) + CHIP.pad * 2
      const box = { x, y: PILL.y, w, h: PILL.h }
      x += w + CHIP.gap
      return box
    })
  }

  function inBox(b: Box, x: number, y: number, m = 0) {
    return x >= b.x - m && x <= b.x + b.w + m && y >= b.y - m && y <= b.y + b.h + m
  }

  // what sits under a canvas point
  function target(x: number, y: number): string | null {
    if (closeBox && inBox(closeBox, x, y, 6)) return 'close'
    for (let i = 0; i < links.length; i++) if (inBox(links[i], x, y, 4)) return `link:${i}`
    if (inBox(PILL, x, y, 8)) return 'pill'
    for (let i = 0; i < chips.length; i++) if (inBox(chips[i], x, y, 4)) return `chip:${i}`
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

  function drawKanban() {
    cols.forEach((col, i) => {
      const x = COLS.x + i * (COLS.w + COLS.gap)
      ctx.strokeStyle = LINE
      ctx.lineWidth = 1.5
      roundRect(x, COLS.y, COLS.w, COLS.h, 12)
      ctx.stroke()
      label(`${col.name} · ${col.cards.length}`, x + 14, COLS.y + 26, 11, MUTED, { spacing: 2.5, upper: true })
      let cy = COLS.y + 44
      for (const c of col.cards.slice(0, 6)) {
        ctx.fillStyle = 'rgba(244,241,234,.07)'
        roundRect(x + 12, cy, COLS.w - 24, 30, 6)
        ctx.fill()
        ctx.save()
        ctx.beginPath()
        ctx.rect(x + 12, cy, COLS.w - 24, 30)
        ctx.clip()
        label(c, x + 22, cy + 20, 13, INK)
        ctx.restore()
        cy += 38
      }
      if (col.cards.length > 6) label(`+${col.cards.length - 6} more`, x + 14, cy + 14, 11, MUTED)
    })
  }

  // the answer card: over the kanban and the log, large type, lines typed in; link lines underlined
  function drawAnswer(i: number) {
    const p = PROMPTS[i]
    ctx.fillStyle = '#0f131a'
    roundRect(CARD.x, CARD.y, CARD.w, CARD.h, 14)
    ctx.fill()
    ctx.strokeStyle = 'rgba(201,169,97,.55)'
    ctx.lineWidth = 1.5
    ctx.stroke()
    label(p.label, CARD.x + CARD.pad, CARD.y + 40, 16, ACCENT, { weight: 600 })
    const closeW = textWidth('Close', 14)
    closeBox = { x: CARD.x + CARD.w - CARD.pad - closeW, y: CARD.y + 22, w: closeW, h: 24 }
    label('Close', closeBox.x, CARD.y + 40, 14, hoverKey === 'close' ? INK : MUTED)

    const maxW = CARD.w - CARD.pad * 2
    let y = CARD.y + 82
    const shownLines = answering === i ? answerFired : p.lines.length
    ctx.font = `${CARD.size}px ${FONT}`
    for (const l of p.lines.slice(0, shownLines)) {
      const rows = wrapText(l.text, maxW, (s) => ctx.measureText(s).width)
      for (const row of rows) {
        if (y > CARD.y + CARD.h - 16) break
        if (l.url) {
          const k = `link:${links.length}`
          const hot = hoverKey === k
          label(row, CARD.x + CARD.pad, y, CARD.size, hot ? INK : ACCENT)
          ctx.font = `${CARD.size}px ${FONT}`
          const w = ctx.measureText(row).width
          ctx.strokeStyle = hot ? INK : 'rgba(201,169,97,.7)'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(CARD.x + CARD.pad, y + 5)
          ctx.lineTo(CARD.x + CARD.pad + w, y + 5)
          ctx.stroke()
          links.push({ x: CARD.x + CARD.pad, y: y - 20, w, h: 28, url: l.url })
        } else {
          label(row, CARD.x + CARD.pad, y, CARD.size, INK)
        }
        ctx.font = `${CARD.size}px ${FONT}`
        y += CARD.lead
      }
      y += CARD.para
    }
  }

  function draw(now: number, dt: number) {
    const running = runStart >= 0
    if (chips.length === 0) layoutChips()
    links = []
    closeBox = null
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#0b0e13'
    ctx.fillRect(0, 0, W, H)

    // the menu bar: whose laptop this is, and the visitor's own clock
    ctx.fillStyle = 'rgba(244,241,234,.05)'
    ctx.fillRect(0, 0, W, 26)
    label('Devak Mehta · AI Engineer', 28, 17, 11, INK, { spacing: 2.5, upper: true })
    label(clock(), W - 28, 17, 11, MUTED, { align: 'right', font: MONO })

    // header
    label('D.V · session board', 28, 52, 15, ACCENT, { spacing: 4, upper: true })
    label(`Ops floor · ${stateWord(state)}`, 28, 90, 26, INK)
    label('3 sessions running, 18 tickets', 940, 56, 14, MUTED, { align: 'right' })
    label('0 alerts, read-only checks', 940, 80, 14, MUTED, { align: 'right' })
    drawGlobe(1050, 90, 62, now, dt)

    // what this is, in two lines; each shrinks to fit the band left of the globe
    fit('D.V is an assistant I built to work tickets with me. It investigates, runs read-only checks and helps me prepare the pull request.', 28, 150, 16, INK, 930)
    fit('This copy runs on invented tickets. Ask it about me with the buttons below.', 28, 178, 16, MUTED, 930)

    // the pill: runs the demo investigation
    // the pulsing halo invites the first run only; after that the pill sits still
    if (!running && runs === 0 && shown === null) {
      const pulse = (Math.sin(now / 300) + 1) / 2
      ctx.strokeStyle = `rgba(201,169,97,${0.25 + pulse * 0.35})`
      ctx.lineWidth = 8
      roundRect(PILL.x - 4, PILL.y - 4, PILL.w + 8, PILL.h + 8, 26)
      ctx.stroke()
    }
    ctx.strokeStyle = ACCENT
    ctx.lineWidth = 1.5
    ctx.fillStyle = hoverKey === 'pill' && !running ? 'rgba(201,169,97,.18)' : 'rgba(201,169,97,.06)'
    roundRect(PILL.x, PILL.y, PILL.w, PILL.h, 22)
    ctx.fill()
    ctx.stroke()
    const pill = pillLabel(running, runs)
    if (running) label(pill, PILL.x + 22, PILL.y + 28, 13, ACCENT, { spacing: 3 })
    else label(pill, PILL.x + 22, PILL.y + 28, 16, ACCENT, { weight: 600 })

    // the prompt chips: ask D.V about Devak; the one being answered reads RUNNING
    chips.forEach((c, i) => {
      const text = chipLabel(PROMPTS[i].label, i, answering)
      const isRunning = text === 'RUNNING'
      const hot = (hoverKey === `chip:${i}` && !running) || shown === i
      ctx.strokeStyle = hot || isRunning ? ACCENT : LINE
      ctx.lineWidth = 1.5
      ctx.fillStyle = isRunning ? 'rgba(201,169,97,.16)' : hot ? 'rgba(201,169,97,.10)' : 'rgba(244,241,234,.03)'
      roundRect(c.x, c.y, c.w, c.h, 22)
      ctx.fill()
      ctx.stroke()
      if (isRunning) label(text, c.x + CHIP.pad, c.y + 28, 13, ACCENT, { spacing: 3 })
      else label(text, c.x + CHIP.pad, c.y + 28, CHIP.size, hot ? ACCENT : INK)
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

    if (shown !== null) {
      drawAnswer(shown)
    } else {
      drawKanban()
      // the log: the investigation's last three lines
      ctx.strokeStyle = LINE
      ctx.beginPath()
      ctx.moveTo(LOG.x, LOG.line)
      ctx.lineTo(W - 28, LOG.line)
      ctx.stroke()
      if (lines.length === 0) {
        label(`› ${runs > 0 ? 'Ticket 1042 closed. ' : ''}Pick a question above, or watch D.V work.`, LOG.x, LOG.first, 14, MUTED, { font: MONO })
      } else {
        let ly = LOG.first - 8
        for (const l of lines.slice(-3)) {
          label(l.who, LOG.x, ly, 14, CYAN, { font: MONO })
          label(`· ${l.text}`, LOG.textX, ly, 14, INK, { font: MONO })
          ly += LOG.step
        }
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
      if (key === 'close') {
        shown = null
        answering = null
        setState('idle')
      } else if (key && key.startsWith('link:')) {
        const url = links[Number(key.slice(5))].url
        if (url.startsWith('mailto:') || url.startsWith('./')) window.location.href = url
        else window.open(url, '_blank', 'noopener,noreferrer')
      } else if (key === 'pill' || (key === null && runs === 0 && shown === null)) start(now)
      else if (key && key.startsWith('chip:')) ask(Number(key.slice(5)), now)
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
