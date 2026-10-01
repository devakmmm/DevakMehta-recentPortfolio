// The minimalist page (src/minimal/render.ts): plain HTML rendered at build time from the profile, for
// visitors who want the facts and the resume without the 3D desk.
import test from 'node:test'
import assert from 'node:assert/strict'
import { renderMinimal } from '../src/minimal/render.ts'

const profile = {
  name: 'Ada Example',
  role: 'AI Engineer',
  intro: ['I build small models & the tools around them.'],
  links: { github: 'https://github.com/ada', linkedin: 'https://www.linkedin.com/in/ada', email: 'ada@example.com', home: 'https://ada.example/' },
  builds: [
    { name: 'Snake bot', line: 'Plays Snake from sentences <fast>.', href: 'https://ada.example/snake/' },
    { name: 'Voice box', line: 'A talking assistant on the desk.' },
  ],
  now: ['Wiring the microphone.'],
}

test('the page leads with the name and the role', () => {
  const html = renderMinimal(profile)
  assert.ok(html.indexOf('Ada Example') < html.indexOf('AI Engineer'), 'name, then role')
  assert.ok(html.indexOf('AI Engineer') < html.indexOf('Snake bot'), 'both before the builds')
})

test('the resume link is there when the profile has one, and absent when it does not', () => {
  const withFile = { ...profile, links: { ...profile.links, resume: 'resume.pdf' } }
  const withUrl = { ...profile, links: { ...profile.links, resume: 'https://drive.example/cv' } }
  assert.match(renderMinimal(withFile), /href="\.\.\/resume\.pdf"[^>]*>Resume/, 'a file in the site, relative to /minimal/')
  assert.match(renderMinimal(withUrl), /href="https:\/\/drive\.example\/cv"[^>]*>Resume/, 'a link elsewhere, as given')
  assert.doesNotMatch(renderMinimal(profile), />Resume/)
})

test('every way to reach the person is a working link', () => {
  const html = renderMinimal(profile)
  assert.match(html, /href="mailto:ada@example\.com"/)
  assert.match(html, /href="https:\/\/www\.linkedin\.com\/in\/ada"/)
  assert.match(html, /href="https:\/\/github\.com\/ada"/)
  assert.match(html, /href="\.\.\/"/, 'a way back to the 3D desk')
})

test('every build is listed, linked when it has a page, and text is escaped', () => {
  const html = renderMinimal(profile)
  assert.match(html, /<a href="https:\/\/ada\.example\/snake\/"[^>]*>Snake bot<\/a>/)
  assert.ok(html.includes('Voice box') && html.includes('A talking assistant on the desk.'))
  assert.ok(html.includes('&lt;fast&gt;') && !html.includes('<fast>'), 'build text is escaped')
  assert.ok(html.includes('small models &amp; the tools'), 'intro text is escaped')
  assert.ok(html.includes('Wiring the microphone.'))
})

test('a profile without LinkedIn or email simply leaves those links out', () => {
  const bare = { ...profile, links: { github: 'https://github.com/ada', home: 'https://ada.example/' } }
  const html = renderMinimal(bare)
  assert.match(html, /href="https:\/\/github\.com\/ada"/, 'the links it does have stay')
  assert.doesNotMatch(html, /mailto:|linkedin/)
})
