// The real profile (src/data/profile.ts) that the minimalist page and the board both read.
import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { PROFILE } from '../src/data/profile.ts'
import { renderMinimal } from '../src/minimal/render.ts'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

test('the board has an answer for every question, short enough to read in the card', () => {
  for (const key of ['who', 'built', 'now']) {
    const lines = PROFILE.answers[key]
    assert.ok(lines.length >= 2 && lines.length <= 4, `${key}: 2 to 4 lines, got ${lines.length}`)
    for (const l of lines) assert.ok(l.length <= 160, `${key}: a line over 160 characters: "${l}"`)
  }
})

test('the minimalist page carries a way to reach Devak and the builds', () => {
  const html = renderMinimal(PROFILE)
  assert.match(html, /href="mailto:[^"@]+@[^"]+"/, 'an email link')
  assert.match(html, /href="https:\/\/www\.linkedin\.com\/in\/[^"]+"/, 'a LinkedIn link')
  assert.ok(PROFILE.builds.length >= 4, 'at least four builds')
  for (const b of PROFILE.builds) assert.ok(html.includes(b.name), `build missing: ${b.name}`)
  assert.ok(PROFILE.intro.length >= 1 && PROFILE.now.length >= 1, 'an intro and what is next')
})

test('a resume given as a file points at a file that exists in public/', () => {
  const r = PROFILE.links.resume
  if (!r || /^https?:/.test(r)) return
  assert.ok(existsSync(path.join(root, 'public', r)), `public/${r} does not exist`)
})

test('the desk hero has a title and a short paragraph', () => {
  assert.ok(PROFILE.desk.title.length > 0 && PROFILE.desk.title.length <= 40)
  assert.ok(PROFILE.desk.hero.length === 1 && PROFILE.desk.hero[0].length <= 320, 'one paragraph, under about three lines')
})
