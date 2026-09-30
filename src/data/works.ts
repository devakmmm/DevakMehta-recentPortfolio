// Works data: the builds, grouped into sections → click opens a detail.
// Pure data: add or remove sections / items here only; Works.tsx just renders.
//
// Section fields:
//   id        unique id (framer layoutId for the shared-element animation)
//   no        '01'…'04'
//   title     section title
//   tagline   one line on the right of the index row
//   items[]   flat list: { name, meta?, tags?, link?, slug? }
//             clicking an item opens the detail; a matching src/content/works/<slug>.md renders as
//             a full write-up, otherwise the shared placeholder shows (detailPlaceholder)
//   groups[]  grouped items (instead of items): { heading, items: string[] }
//   awards[]  optional chips
//   footer    optional one-line note

export interface WorkListItem {
  name: string
  meta?: string
  tags?: string[]
  link?: string
  slug?: string
}

export interface WorkGroup {
  heading: string
  items: string[]
}

export interface WorkSection {
  id: string
  no: string
  title: string
  tagline: string
  items?: WorkListItem[]
  groups?: WorkGroup[]
  awards?: string[]
  footer?: string
}

export interface WorksLang {
  title: string
  closeLabel: string
  openLabel: string
  hint: string
  awardsLabel: string
  visitLabel: string
  detailPlaceholder: string
  phImageLabel: string
  phButtonLabel: string
  countLabel: (n: number) => string
  sections: WorkSection[]
}

const HOME = 'https://devakmmm.github.io/'

const SECTIONS: WorkSection[] = [
  {
    id: 'models',
    no: '01',
    title: 'Decision models',
    tagline: 'a model that decides from sentences',
    items: [
      { name: 'Sentence Snake', meta: '3 of 10 unseen games won', link: `${HOME}sentence-snake/`, slug: 'sentence-snake' },
      { name: 'Tetris, the ranking head', meta: 'matches its teacher on 2 of 3 seeds', slug: 'tetris-ranking-head' },
      { name: 'Documents it had never seen', meta: 'zero silent mistakes with a second check', slug: 'unseen-documents' },
    ],
    footer: '149M parameters · a 199K-parameter head · trained on an integrated GPU',
  },
  {
    id: 'hardware',
    no: '02',
    title: 'Hardware',
    tagline: 'an ESP32, a webcam, a spare monitor',
    items: [
      { name: 'The puck', meta: 'a talking assistant on the desk, the model on the laptop', slug: 'the-puck' },
      { name: "D.V's Lab", meta: 'hand-tracked 3D, own WebGL renderer', slug: 'dv-lab' },
      { name: 'Robotics lab', meta: 'policies on an integrated GPU, sim first', slug: 'robotics-lab' },
    ],
    footer: 'ESP32-S3 · WebGL · MediaPipe · LeRobot',
  },
  {
    id: 'agents',
    no: '03',
    title: 'Agent tooling',
    tagline: 'how I work with AI coding agents',
    items: [
      { name: 'make-your-claude', meta: 'six discipline hooks, MIT', link: 'https://github.com/devakmmm/make-your-claude', slug: 'make-your-claude' },
    ],
    footer: 'prove claims before finishing · walk the diff before pushing · never delete a comment silently',
  },
  {
    id: 'learning',
    no: '04',
    title: 'Learning in public',
    tagline: 'five from-scratch paths, one laptop, $0 first',
    groups: [
      { heading: 'Model training', items: ['The training loop, from "what is a gradient"'] },
      { heading: 'AI infrastructure', items: ['The token server, KV-cache bytes by hand'] },
      { heading: 'AI engineering', items: ['Measure a search engine: BM25, recall@k, a gate that fails'] },
      { heading: 'Agents', items: ['The agent loop', 'Deep agents in one file'] },
    ],
  },
]

const EN: WorksLang = {
  title: 'Works',
  closeLabel: 'Back',
  openLabel: 'Explore',
  hint: 'Keep scrolling',
  awardsLabel: 'Awards',
  visitLabel: 'Open',
  detailPlaceholder: 'The write-up for this build is on the home base.',
  phImageLabel: 'Image / Video',
  phButtonLabel: 'Home base',
  countLabel: (n) => `${n} builds`,
  sections: SECTIONS,
}

export const WORKS: Record<'zh' | 'en', WorksLang> = {
  en: EN,
  zh: EN,
}

// Section cover images (by section id): hand-drawn SVGs in the site's palette, nothing downloaded.
const COVERS = `${import.meta.env.BASE_URL}works/covers/`
export const SECTION_COVERS: Record<string, string> = {
  models: `${COVERS}models.svg`,
  hardware: `${COVERS}hardware.svg`,
  agents: `${COVERS}agents.svg`,
  learning: `${COVERS}learning.svg`,
}
