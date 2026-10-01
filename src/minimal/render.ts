import type { Profile } from '../data/profile'

// The minimalist page's body, rendered at build time (vite.config.ts) from the same profile the desk
// uses. Plain HTML, no script. Pure, so it runs under node:test (tests/minimal.test.mjs).
// Links are relative: the page lives at /minimal/ and the desk at /. A resume is a file in public/
// (profile.links.resume = 'resume.pdf') or a link elsewhere (a full URL), shown only when set.

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const out = (href: string, text: string, cls = '') =>
  `<a${cls ? ` class="${cls}"` : ''} href="${esc(href)}" target="_blank" rel="noopener">${esc(text)}</a>`

export function renderMinimal(profile: Profile): string {
  const { links } = profile
  const resume = links.resume ? (/^https?:/.test(links.resume) ? links.resume : `../${links.resume}`) : ''
  // one primary action (the resume, or the email until there is one), then plain links
  const primary = resume
    ? out(resume, 'Resume', 'mn-btn')
    : links.email
      ? `<a class="mn-btn" href="mailto:${esc(links.email)}">${esc(links.email)}</a>`
      : ''
  const reach = [
    primary,
    resume && links.email ? `<a href="mailto:${esc(links.email)}">${esc(links.email)}</a>` : '',
    links.linkedin ? out(links.linkedin, 'LinkedIn') : '',
    out(links.github, 'GitHub'),
  ].filter(Boolean)

  const builds = profile.builds
    .map((b) => `<li>${b.href ? out(b.href, b.name) : `<b>${esc(b.name)}</b>`}<span>${esc(b.line)}</span></li>`)
    .join('\n')

  return `<header class="mn-head">
<h1 class="mn-name">${esc(profile.name)}</h1>
<p class="mn-role">${esc(profile.role)}</p>
</header>
<nav class="mn-reach" aria-label="Resume and contact">
${reach.join('\n')}
</nav>
<section class="mn-intro">
${profile.intro.map((p) => `<p>${esc(p)}</p>`).join('\n')}
</section>
<section>
<h2>What I've built</h2>
<ul class="mn-builds">
${builds}
</ul>
</section>
<section>
<h2>What I'm working on</h2>
<ul class="mn-now">
${profile.now.map((n) => `<li>${esc(n)}</li>`).join('\n')}
</ul>
</section>
<footer class="mn-foot">
<a href="../">See the 3D desk</a>
${out(links.home, 'All the build write-ups')}
</footer>`
}
