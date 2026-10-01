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

test('the first screen has no scroll cue and no sideways text', () => {
  const app = visibleLines('src/App.tsx').map((l) => l.line).join('\n')
  assert.doesNotMatch(app, /scroll-cue|SCROLL/, 'no "scroll" cue with a bar')
  assert.doesNotMatch(app, /hm-right/, 'no vertical text down the side')
})
