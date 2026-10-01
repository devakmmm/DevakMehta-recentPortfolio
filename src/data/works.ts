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
    tagline: 'models that decide from plain descriptions',
    items: [
      { name: 'Sentence Snake', meta: 'plays Snake by reading a description of each move', link: `${HOME}sentence-snake/`, slug: 'sentence-snake' },
      { name: 'Tetris, picking the best spot', meta: 'picks the best place for every piece', slug: 'tetris-ranking-head' },
      { name: 'Documents it had never seen', meta: 'hands the documents it is unsure about to a person', slug: 'unseen-documents' },
    ],
  },
  {
    id: 'hardware',
    no: '02',
    title: 'Hardware',
    tagline: 'devices for the desk',
    items: [
      { name: 'The puck', meta: 'a voice assistant for the desk, in progress', slug: 'the-puck' },
      { name: "D.V's Lab", meta: 'a 3D part you move with your bare hands', slug: 'dv-lab' },
      { name: 'Robotics lab', meta: 'a robot that learns from demonstrations, in simulation for now', slug: 'robotics-lab' },
    ],
  },
  {
    id: 'agents',
    no: '03',
    title: 'Agent tooling',
    tagline: 'how I work with AI coding agents',
    items: [
      { name: 'make-your-claude', meta: 'makes an AI coding assistant check its own work', link: 'https://github.com/devakmmm/make-your-claude', slug: 'make-your-claude' },
    ],
  },
  {
    id: 'learning',
    no: '04',
    title: 'Self-study paths',
    tagline: 'four paths I am working through',
    groups: [
      { heading: 'Model training', items: ['The training loop, from "what is a gradient"'] },
      { heading: 'AI infrastructure', items: ['A token server, with its memory use worked out by hand'] },
      { heading: 'AI engineering', items: ['Measuring a search engine, with a test that fails when results get worse'] },
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
