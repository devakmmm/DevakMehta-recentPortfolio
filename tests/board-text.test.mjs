// What the D.V board says about itself (src/ui/boardText.ts): the labels that change while something
// runs, and how an answer is wrapped to fit the answer card.
import test from 'node:test'
import assert from 'node:assert/strict'
import { chipLabel, pillLabel, stateWord, wrapText } from '../src/ui/boardText.ts'

test('while a prompt runs, its chip reads RUNNING and the other chips keep their labels', () => {
  assert.equal(chipLabel('Who is Devak?', 0, 0), 'RUNNING')
  assert.equal(chipLabel('Building now', 2, 0), 'Building now')
  assert.equal(chipLabel('Who is Devak?', 0, null), 'Who is Devak?')
})

test('the pill invites a first run, reads RUNNING during one, and offers a rerun after', () => {
  assert.equal(pillLabel(true, 0), 'RUNNING')
  assert.equal(pillLabel(true, 3), 'RUNNING')
  assert.notEqual(pillLabel(false, 0), 'RUNNING')
  assert.notEqual(pillLabel(false, 0), pillLabel(false, 1), 'the label after a run differs from the first invitation')
})

test('the header reads running for any working state and all quiet when idle', () => {
  assert.equal(stateWord('thinking'), 'running')
  assert.equal(stateWord('speaking'), 'running')
  assert.equal(stateWord('idle'), 'all quiet')
})

test('answers wrap at word boundaries inside the card width', () => {
  const measure = (s) => s.length * 10 // 10 px per character
  const text = 'Devak builds the model, the software around it, and sometimes the hardware too.'
  const lines = wrapText(text, 200, measure)
  assert.ok(lines.length > 1, 'a long answer takes several lines')
  for (const l of lines) assert.ok(measure(l) <= 200, `line too wide: "${l}"`)
  assert.equal(lines.join(' '), text, 'no word is lost or split')
  assert.deepEqual(wrapText('short', 200, measure), ['short'])
})
