import { motion } from 'framer-motion'
import { SOCIAL_ICONS } from './SocialIcons'
import { FOCUS_POINTS } from '../data/focusPoints'

// Links shown on the timeline. Only public, personal places.
const LINKS = [
  { id: 'home', label: 'Home base', href: 'https://devakmmm.github.io/' },
  { id: 'github', label: 'GitHub', href: 'https://github.com/devakmmm' },
]

// Timeline data. One entry per camera stop on the desk, in the order of FOCUS_POINTS:
// 1 the puck · 2 the laptop (Sentence Snake) · 3 the pyramid (D.V's Lab) · 4 the notebook (posts) · 5 the hooks card.
interface ResumeGroup {
  heading?: string
  logoImg?: string
  sub?: string
  link?: string
  items?: string[]
  links?: { id: string; label: string; href: string }[]
}
interface ResumeEntry {
  period: string
  place: string
  role?: string
  logo?: { src: string; alt: string }
  points?: string[]
  groups?: ResumeGroup[]
}

const ENTRIES: ResumeEntry[] = [
  {
    period: 'Hardware',
    place: 'The puck',
    role: "A desk voice assistant I'm building on an ESP32-S3",
    points: [
      'The firmware is written from scratch, with its own WebSocket server and LED driver and no third-party libraries',
      'So far it joins WiFi and pairs with my laptop. The microphone, speaker and ring of lights come next',
      'Audio will stay on my home network; only the transcript text goes to a hosted model for the reply',
    ],
  },
  {
    period: 'Models',
    place: 'Sentence Snake',
    role: 'A 149M-parameter model that plays Snake by reading a short sentence about each of its three options',
    points: [
      'It gives each option a probability and the snake takes the best one. No rule overrides its pick',
      'When it says 35%, it is right about 34% of the time',
      'Trained in under 8 minutes on an integrated GPU. On 10 games it had never seen, it beat the rule it learned from in 3',
    ],
  },
  {
    period: 'Workshop',
    place: "D.V's Lab",
    role: 'A 3D part on screen that you move with your bare hands',
    points: [
      'A webcam watches your hands. An open palm turns the part, a pinch drags it, two hands scale it, a held fist pulls it apart',
      'It runs on a WebGL renderer I wrote, with hand tracking in the browser',
      "Next is a pepper's ghost pyramid on a spare monitor, so the part appears to float",
    ],
  },
  {
    period: 'Writing',
    place: 'Build logs',
    role: 'A short write-up for each build as it ships',
    points: ['What it does, how it was made, and one measured result'],
    groups: [{ heading: 'Home base', sub: 'a page per build as it lands', link: 'https://devakmmm.github.io/' }],
  },
  {
    period: 'Agents',
    place: 'make-your-claude',
    role: 'Six open-source hooks for an AI coding agent',
    points: [
      'The agent has to say whether it verified its claims before it finishes, sees a checklist before its first push, and gets a warning when an edit deletes comments',
      "It uses only Python's standard library, has 24 tests and an MIT licence",
    ],
    groups: [{ heading: 'Open source', sub: 'used daily before it was published', link: 'https://github.com/devakmmm/make-your-claude', links: LINKS }],
  },
]

const RESUME: Record<'en' | 'zh', { title: string; entries: ResumeEntry[] }> = {
  en: { title: 'Builds', entries: ENTRIES },
  zh: { title: 'Builds', entries: ENTRIES },
}

// Entries map one-to-one onto the glb focus anchors (camera stops); the list is the single source
// of truth, see data/focusPoints.ts (Scene.tsx reads it too).
const POINT_ORDER = FOCUS_POINTS

const EASE = [0.22, 1, 0.36, 1]
const containerV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
}
const itemV = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
}

function Group({ group }: { group: ResumeGroup }) {
  const heading = group.link ? (
    <a className="about-link" href={group.link} target="_blank" rel="noopener noreferrer">
      {group.heading}
    </a>
  ) : (
    <span>{group.heading}</span>
  )

  return (
    <motion.div className="tl-group" variants={itemV}>
      <div className="tl-group-head">
        {group.logoImg && (
          <span className="tl-group-logo">
            <img src={group.logoImg} alt={group.heading || ''} loading="lazy" />
          </span>
        )}
        {heading}
        {group.sub && <span className="tl-group-sub">{group.sub}</span>}
      </div>
      {group.items && (
        <ul className="tl-points">
          {group.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      )}
      {group.links && (
        <div className="tl-logos">
          {group.links.map((l) => {
            const Icon = SOCIAL_ICONS[l.id as keyof typeof SOCIAL_ICONS]
            return (
              <a
                key={l.id}
                className="tl-logo"
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={l.label}
                title={l.label}
              >
                <Icon />
              </a>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

function Entry({ entry, index }: { entry: ResumeEntry; index: number }) {
  return (
    <motion.div
      className="tl-entry"
      data-point={POINT_ORDER[index]}
      variants={containerV}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-12% 0px -12% 0px' }}
    >
      <motion.span className="tl-dot" variants={itemV} aria-hidden="true" />
      {/* tl-body wraps the text (the dot stays outside as the timeline mark). A plain div, not
          motion: framer variants pass through it via context, so the leaves stay direct stagger
          children of tl-entry and the entrance animation is unchanged. */}
      <div className="tl-body">
        <motion.div className="tl-period" variants={itemV}>
          {entry.period}
        </motion.div>
        <motion.div className="tl-head" variants={itemV}>
          {entry.logo && (
            <span className="tl-logo-chip">
              <img src={entry.logo.src} alt={entry.logo.alt} loading="lazy" />
            </span>
          )}
          <h3 className="tl-place">{entry.place}</h3>
        </motion.div>
        {entry.role && (
          <motion.div className="tl-role" variants={itemV}>
            {entry.role}
          </motion.div>
        )}
        {entry.points && (
          <motion.ul className="tl-points" variants={itemV}>
            {entry.points.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </motion.ul>
        )}
        {entry.groups && entry.groups.map((g, i) => <Group key={i} group={g} />)}
      </div>
    </motion.div>
  )
}

export default function Resume({ lang }: { lang: 'en' | 'zh' }) {
  const data = RESUME[lang]
  return (
    <section className="resume" lang={lang}>
      <motion.h2
        className="resume-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        {data.title}
      </motion.h2>
      <div className="timeline">
        {data.entries.map((e, i) => (
          <Entry key={i} entry={e} index={i} />
        ))}
      </div>
    </section>
  )
}
