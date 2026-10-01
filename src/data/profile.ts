// Who Devak is, in one place. The minimalist page (src/minimal/render.ts) renders from this, and the
// board on the laptop screen (ui/dvBoard.ts) answers its prompts from it, so the two never disagree.
// Plain data, no import.meta, so vite.config.ts and node:test can both import it.
// Copy rules (tests/copy.test.mjs checks them): plain sentences, no em dashes, no middle-dot chains.
// Every claim here was checked against each build's own notes on 2026-09-30:
// the puck is in progress (WiFi and pairing work, the microphone is next), its replies will come from
// a hosted model, and the pyramid is a plan.

export interface Build {
  name: string
  line: string
  href?: string
}

export interface Profile {
  name: string
  role: string
  // the hero over the 3D desk, first person
  desk: { title: string; hero: string[] }
  // the minimalist page, first person
  intro: string[]
  // resume: a file in public/ ('resume.pdf') or a full URL; the Resume buttons show only when set
  links: { github: string; linkedin?: string; email?: string; home: string; resume?: string }
  builds: Build[]
  now: string[]
  // what D.V says on the board, about Devak, in the third person
  answers: { who: string[]; built: string[]; now: string[] }
}

const HOME = 'https://devakmmm.github.io/'

export const PROFILE: Profile = {
  name: 'Devak Mehta',
  role: 'AI Engineer',
  desk: {
    title: "Hi, I'm Devak.",
    hero: [
      "I'm an AI engineer. I train small models, write the software around them, and sometimes build the hardware too. Click the laptop to try a copy of D.V, the assistant I built to work tickets with me.",
    ],
  },
  intro: [
    'I train small models, write the software around them, and sometimes build the hardware too.',
    'Everything below was built on one laptop with an integrated GPU.',
  ],
  // LinkedIn and email as Devak published them on his previous site (personal, never the work address)
  links: {
    github: 'https://github.com/devakmmm',
    linkedin: 'https://www.linkedin.com/in/devak-mehta',
    email: 'mdevak44@gmail.com',
    home: HOME,
  },
  builds: [
    {
      name: 'Sentence Snake',
      line: 'A 149M-parameter model that plays Snake by reading a short sentence about each possible move. Trained in under 8 minutes, it beat the rule it learned from in 3 of 10 games it had never seen.',
      href: `${HOME}sentence-snake/`,
    },
    {
      name: 'D.V',
      line: 'An assistant I built to work tickets with me. It picks up a ticket, runs read-only checks, writes up what it found, and helps me prepare the pull request.',
    },
    {
      name: 'make-your-claude',
      line: 'Six open-source hooks for an AI coding agent. They make it say whether it checked its claims before it finishes, show a checklist before its first push, and warn when an edit deletes comments.',
      href: 'https://github.com/devakmmm/make-your-claude',
    },
    {
      name: "D.V's Lab",
      line: 'A 3D part on screen that you turn, drag and pull apart with your bare hands in front of a webcam. It runs on a WebGL renderer I wrote, with hand tracking in the browser.',
    },
    {
      name: 'The puck',
      line: "A desk voice assistant I'm building on an ESP32-S3. Its firmware, written from scratch with no third-party libraries, already joins WiFi and pairs with my laptop.",
    },
    {
      name: 'Robotics lab',
      line: 'Robot-learning experiments, with policies that learn by imitating demonstrations, trained in simulation on the same laptop.',
    },
  ],
  now: [
    'This site. The 3D desk, the board on its laptop and this page were built this week.',
    "The puck's microphone is next, then its speaker and its ring of lights.",
    "After that, a pepper's ghost pyramid over a spare monitor, so the hand-tracked part looks like it floats.",
  ],
  answers: {
    who: [
      'Devak Mehta is an AI engineer. He trains small models, writes the software around them, and sometimes builds the hardware too.',
      'He built D.V, the assistant on this screen, to work tickets with him. It picks up a ticket, runs read-only checks and writes up what it found.',
      'His Snake model trained in under 8 minutes on a laptop GPU and beat the rule it learned from in 3 of 10 new games.',
    ],
    built: [
      'Sentence Snake, a 149M-parameter model that plays Snake by reading a sentence about each possible move.',
      'D.V, the assistant on this screen, which helps him investigate tickets. This copy runs on invented ones.',
      "D.V's Lab, a 3D part you move with your bare hands through a webcam, on a renderer he wrote.",
      'make-your-claude, six open-source hooks that make an AI coding agent say whether it checked its work.',
    ],
    now: [
      'This site. He built the desk, this board and a one-page version this week.',
      'The puck on the desk. Its firmware already joins WiFi and pairs with his laptop; the microphone and speaker are next.',
      "Then a pepper's ghost pyramid over a spare monitor, so the hand-tracked part looks like it floats.",
    ],
  },
}
