// The words a visitor reads must not carry the tells that make a page look machine-written: no em
// dashes, no chains of middle dots, and no "scroll" cue or sideways text on the first screen.
// Scans the files that hold visitor-facing copy; code comments are skipped (many are upstream's).
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const works = readdirSync(path.join(root, 'src/content/works')).map((f) => `src/content/works/${f}`)
const FILES = [
  'src/App.tsx',
  'src/ui/Resume.tsx',
  'src/ui/dvBoard.ts',
  'src/data/works.ts',
  'src/data/profile.ts',
  'src/minimal/render.ts',
  'minimal/index.html',
  'index.html',
  ...works,
]

// visible lines: drop comment-only lines and trailing // comments outside quotes
function visibleLines(file) {
  const text = readFileSync(path.join(root, file), 'utf8')
  const code = /\.(t|j)sx?$/.test(file)
  return text.split(/\r?\n/).flatMap((line, i) => {
    if (code) {
      const t = line.trim()
      if (t.startsWith('//') || t.startsWith('*') || t.startsWith('/*') || t.startsWith('{/*')) return []
      const at = line.search(/\s\/\/\s/)
      if (at >= 0 && (line.slice(0, at).match(/['"`]/g) || []).length % 2 === 0) line = line.slice(0, at)
    }
    return [{ n: i + 1, line }]
  })
}

test('no em dash in anything a visitor reads', () => {
  const hits = FILES.flatMap((f) => visibleLines(f).filter((l) => l.line.includes('—')).map((l) => `${f}:${l.n}: ${l.line.trim()}`))
  assert.deepEqual(hits, [])
})

// one piece of copy: each quoted string on a line, plus what is left outside quotes (JSX text)
function pieces(line) {
  const strings = line.match(/'[^']*'|"[^"]*"|`[^`]*`/g) || []
  let rest = line
  for (const s of strings) rest = rest.replace(s, ' ')
  return [...strings, rest]
}

test('no chains of middle dots (two or more in one piece of copy)', () => {
  const hits = FILES.flatMap((f) =>
    visibleLines(f)
      .filter((l) => pieces(l.line).some((p) => /·[^·]*·/.test(p)))
      .map((l) => `${f}:${l.n}: ${l.line.trim()}`)
  )
  assert.deepEqual(hits, [])
})

// Devak, 2026-09-30: each build's description shows what it is and how it helps, not how it was built.
const HOW_IT_WAS_BUILT = [
  /\d[\d,.]*\s?[MK]-?parameter/i, // parameter counts
  /\b\d+ tests\b/i, // test counts
  /calibrat/i, // calibration talk
  /right about \d+%/i, // "right about 34% of the time"
  /trained in (under|about) \d+/i, // training times
  /\d+\s?(to \d+\s?)?ms per move/i, // latency
  /\b\d[\d,]* bytes\b/i, // build sizes
]

test('build descriptions say what each build does, not how it was built', () => {
  const copy = FILES.filter((f) => !/App\.tsx|index\.html|render\.ts/.test(f))
  const hits = copy.flatMap((f) =>
    visibleLines(f)
      .filter((l) => HOW_IT_WAS_BUILT.some((re) => re.test(l.line)))
      .map((l) => `${f}:${l.n}: ${l.line.trim().slice(0, 90)}`)
  )
  assert.deepEqual(hits, [])
})

test('the first screen has no scroll cue and no sideways text', () => {
  const app = visibleLines('src/App.tsx').map((l) => l.line).join('\n')
  assert.doesNotMatch(app, /scroll-cue|SCROLL/, 'no "scroll" cue with a bar')
  assert.doesNotMatch(app, /hm-right/, 'no vertical text down the side')
})
